import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { wallets, walletLedger } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const walletRouter = createRouter({
  getBalances: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userWallets = await db.select().from(wallets)
      .where(eq(wallets.userId, ctx.user.id));

    return userWallets.map(w => ({
      id: w.id,
      type: w.type,
      balance: parseFloat(w.balance?.toString() || "0"),
      lockedBalance: parseFloat(w.lockedBalance?.toString() || "0"),
    }));
  }),

  getTransactions: authedQuery.input(z.object({
    walletType: z.string().optional(),
    limit: z.number().default(20),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    const db = getDb();

    let targetWalletIds: number[] = [];

    if (input.walletType) {
      const [w] = await db.select().from(wallets)
        .where(and(eq(wallets.userId, ctx.user.id), eq(wallets.type, input.walletType as "MAIN" | "COMMISSION" | "BONUS" | "REWARD")));
      if (w) targetWalletIds = [w.id];
    } else {
      const allWallets = await db.select().from(wallets)
        .where(eq(wallets.userId, ctx.user.id));
      targetWalletIds = allWallets.map(w => w.id);
    }

    if (targetWalletIds.length === 0) return { transactions: [], total: 0 };

    const allLedger = await db.select().from(walletLedger)
      .where(eq(walletLedger.walletId, targetWalletIds[0]))
      .orderBy(desc(walletLedger.createdAt));

    const filtered = targetWalletIds.length === 1
      ? allLedger
      : allLedger.filter(l => targetWalletIds.includes(l.walletId));

    const total = filtered.length;
    const paginated = filtered.slice(input.offset, input.offset + input.limit);

    return { transactions: paginated, total };
  }),

  transfer: authedQuery.input(z.object({
    fromType: z.enum(["MAIN", "COMMISSION", "BONUS", "REWARD"]),
    toType: z.enum(["MAIN", "COMMISSION", "BONUS", "REWARD"]),
    amount: z.number().positive(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const userId = ctx.user.id;

    if (input.fromType === input.toType) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot transfer to same wallet" });
    }

    // Get source wallet
    const [fromWallet] = await db.select().from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.type, input.fromType)));

    if (!fromWallet) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Source wallet not found" });
    }

    const fromBalance = parseFloat(fromWallet.balance?.toString() || "0");
    if (fromBalance < input.amount) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
    }

    // Get target wallet
    let [toWallet] = await db.select().from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.type, input.toType)));

    if (!toWallet) {
      // Create target wallet if it doesn't exist
      await db.insert(wallets).values({
        userId,
        type: input.toType,
        balance: "0",
      });
      [toWallet] = await db.select().from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.type, input.toType)));
    }

    const toBalance = parseFloat(toWallet.balance?.toString() || "0");

    // Update balances
    await db.update(wallets)
      .set({ balance: (fromBalance - input.amount).toFixed(2) })
      .where(eq(wallets.id, fromWallet.id));

    await db.update(wallets)
      .set({ balance: (toBalance + input.amount).toFixed(2) })
      .where(eq(wallets.id, toWallet.id));

    // Create ledger entries
    await db.insert(walletLedger).values({
      walletId: fromWallet.id,
      type: "DEBIT",
      amount: input.amount.toFixed(2),
      balanceBefore: fromBalance.toFixed(2),
      balanceAfter: (fromBalance - input.amount).toFixed(2),
      description: `Transfer to ${input.toType} wallet`,
      referenceType: "TRANSFER",
    });

    await db.insert(walletLedger).values({
      walletId: toWallet.id,
      type: "CREDIT",
      amount: input.amount.toFixed(2),
      balanceBefore: toBalance.toFixed(2),
      balanceAfter: (toBalance + input.amount).toFixed(2),
      description: `Transfer from ${input.fromType} wallet`,
      referenceType: "TRANSFER",
    });

    return { success: true, message: `Transferred Rs. ${input.amount} from ${input.fromType} to ${input.toType}` };
  }),

  requestWithdrawal: authedQuery.input(z.object({
    amount: z.number().positive().min(500),
    method: z.enum(["BANK", "UPI"]),
    accountDetails: z.record(z.string(), z.string()),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Check main wallet balance
    const [mainWallet] = await db.select().from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.type, "MAIN")));

    if (!mainWallet || parseFloat(mainWallet.balance?.toString() || "0") < input.amount) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
    }

    const { withdrawals } = await import("@db/schema");
    const fee = Math.max(50, input.amount * 0.01); // 1% fee, min 50

    // Create withdrawal request
    const withdrawalResult = await db.insert(withdrawals).values({
      userId: userId,
      amount: input.amount.toFixed(2),
      fee: fee.toFixed(2),
      netAmount: (input.amount - fee).toFixed(2),
      method: input.method,
      accountDetails: input.accountDetails,
      status: "PENDING",
      createdAt: new Date(),
    });
    const withdrawalId = Number((withdrawalResult as any).insertId);

    // Deduct from main wallet
    const currentBalance = parseFloat(mainWallet.balance?.toString() || "0");
    await db.update(wallets)
      .set({ balance: (currentBalance - input.amount).toFixed(2) })
      .where(eq(wallets.id, mainWallet.id));

    await db.insert(walletLedger).values({
      walletId: mainWallet.id,
      type: "DEBIT",
      amount: input.amount.toFixed(2),
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: (currentBalance - input.amount).toFixed(2),
      description: `Withdrawal request #${withdrawalId}`,
      referenceId: withdrawalId.toString(),
      referenceType: "WITHDRAWAL",
    });

    return { success: true, message: "Withdrawal request submitted" };
  }),
});
