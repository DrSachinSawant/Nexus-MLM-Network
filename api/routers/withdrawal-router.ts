import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { withdrawals, wallets, walletLedger, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

export const withdrawalRouter = createRouter({
  getMyWithdrawals: authedQuery.input(z.object({
    status: z.string().optional(),
    limit: z.number().default(20),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    const db = getDb();

    const allWithdrawals = await db.select().from(withdrawals)
      .where(eq(withdrawals.userId, ctx.user.id))
      .orderBy(desc(withdrawals.createdAt));

    let filtered = allWithdrawals;
    if (input.status) {
      filtered = filtered.filter(w => w.status === input.status);
    }

    const total = filtered.length;
    const paginated = filtered.slice(input.offset, input.offset + input.limit);

    return { withdrawals: paginated, total };
  }),

  // Admin endpoints
  getPending: adminQuery.query(async () => {
    const db = getDb();

    const pending = await db.select().from(withdrawals)
      .where(eq(withdrawals.status, "PENDING"))
      .orderBy(desc(withdrawals.createdAt));

    const enriched = [];
    for (const w of pending) {
      const [user] = await db.select().from(users).where(eq(users.id, w.userId));
      enriched.push({
        ...w,
        memberName: user?.name || user?.fullName || "Unknown",
        memberId: user?.memberId,
      });
    }

    return enriched;
  }),

  approve: adminQuery.input(z.object({
    id: z.number(),
  })).mutation(async ({ input }) => {
    const db = getDb();

    await db.update(withdrawals)
      .set({ status: "APPROVED", processedAt: new Date() })
      .where(eq(withdrawals.id, input.id));

    return { success: true, message: "Withdrawal approved" };
  }),

  reject: adminQuery.input(z.object({
    id: z.number(),
    remarks: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();

    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, input.id));
    if (!withdrawal) throw new Error("Withdrawal not found");

    // Refund to user wallet
    const [mainWallet] = await db.select().from(wallets)
      .where(and(eq(wallets.userId, withdrawal.userId), eq(wallets.type, "MAIN")));

    if (mainWallet) {
      const currentBalance = parseFloat(mainWallet.balance?.toString() || "0");
      const refundAmount = parseFloat(withdrawal.amount?.toString() || "0");

      await db.update(wallets)
        .set({ balance: (currentBalance + refundAmount).toFixed(2) })
        .where(eq(wallets.id, mainWallet.id));

      await db.insert(walletLedger).values({
        walletId: mainWallet.id,
        type: "CREDIT",
        amount: refundAmount.toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: (currentBalance + refundAmount).toFixed(2),
        description: `Refund for rejected withdrawal #${input.id}`,
        referenceType: "WITHDRAWAL",
      });
    }

    await db.update(withdrawals)
      .set({ status: "REJECTED", remarks: input.remarks || "Rejected by admin" })
      .where(eq(withdrawals.id, input.id));

    return { success: true, message: "Withdrawal rejected and refunded" };
  }),
});
