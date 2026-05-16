import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, wallets, commissions, withdrawals, transactions, commissionSettings } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const adminRouter = createRouter({
  getDashboardStats: adminQuery.query(async () => {
    const db = getDb();

    const allUsers = await db.select().from(users);
    const allCommissions = await db.select().from(commissions);
    const allWithdrawals = await db.select().from(withdrawals);
    const allTransactions = await db.select().from(transactions);
    const allWallets = await db.select().from(wallets);

    const totalMembers = allUsers.filter(u => u.role !== "admin").length;
    const activeMembers = allUsers.filter(u => u.status === "ACTIVE" && u.role !== "admin").length;
    const inactiveMembers = allUsers.filter(u => u.status === "INACTIVE").length;
    const pendingKyc = allUsers.filter(u => u.kycStatus === "PENDING").length;

    const totalCommissionPayout = allCommissions
      .filter(c => c.status === "PAID")
      .reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);

    const pendingWithdrawals = allWithdrawals.filter(w => w.status === "PENDING").length;
    const totalWithdrawn = allWithdrawals
      .filter(w => w.status === "COMPLETED")
      .reduce((sum, w) => sum + parseFloat(w.amount?.toString() || "0"), 0);

    const totalRevenue = allTransactions
      .filter(t => t.status === "COMPLETED")
      .reduce((sum, t) => sum + parseFloat(t.amount?.toString() || "0"), 0);

    const totalWalletBalance = allWallets.reduce((sum, w) => sum + parseFloat(w.balance?.toString() || "0"), 0);

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      pendingKyc,
      totalCommissionPayout,
      pendingWithdrawals,
      totalWithdrawn,
      totalRevenue,
      totalWalletBalance,
      totalTransactions: allTransactions.length,
    };
  }),

  getCommissionSettings: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(commissionSettings).orderBy(commissionSettings.type, commissionSettings.level);
  }),

  updateCommissionSettings: adminQuery.input(z.object({
    settings: z.array(z.object({
      id: z.number(),
      percentage: z.number(),
      isActive: z.boolean(),
    })),
  })).mutation(async ({ input }) => {
    const db = getDb();

    for (const setting of input.settings) {
      await db.update(commissionSettings)
        .set({
          percentage: setting.percentage.toFixed(2),
          isActive: setting.isActive,
        })
        .where(eq(commissionSettings.id, setting.id));
    }

    return { success: true };
  }),

  getRecentWithdrawals: adminQuery.input(z.object({
    limit: z.number().default(10),
  }).optional()).query(async ({ input }) => {
    const db = getDb();

    const recent = await db.select().from(withdrawals)
      .orderBy(desc(withdrawals.createdAt))
      .limit(input?.limit || 10);

    const enriched = [];
    for (const w of recent) {
      const [user] = await db.select().from(users).where(eq(users.id, w.userId));
      enriched.push({
        ...w,
        memberName: user?.name || user?.fullName || "Unknown",
        memberId: user?.memberId,
      });
    }

    return enriched;
  }),

  getGrowthChart: adminQuery.input(z.object({
    period: z.enum(["week", "month", "year"]).default("month"),
  })).query(async ({ input }) => {
    const db = getDb();

    const allUsers = await db.select().from(users);
    const allCommissions = await db.select().from(commissions);

    // Generate chart data based on period
    const dataPoints = [];
    const now = new Date();

    if (input.period === "week") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const dayMembers = allUsers.filter(u => u.joinDate && new Date(u.joinDate) >= dayStart && new Date(u.joinDate) < dayEnd).length;
        const dayCommissions = allCommissions.filter(c => c.createdAt && new Date(c.createdAt) >= dayStart && new Date(c.createdAt) < dayEnd)
          .reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);

        dataPoints.push({
          label: date.toLocaleDateString("en-IN", { weekday: "short" }),
          members: dayMembers,
          commissions: dayCommissions,
        });
      }
    } else if (input.period === "month") {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const dayMembers = allUsers.filter(u => u.joinDate && new Date(u.joinDate) >= dayStart && new Date(u.joinDate) < dayEnd).length;
        const dayCommissions = allCommissions.filter(c => c.createdAt && new Date(c.createdAt) >= dayStart && new Date(c.createdAt) < dayEnd)
          .reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);

        dataPoints.push({
          label: `${date.getDate()}`,
          members: dayMembers,
          commissions: dayCommissions,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const monthMembers = allUsers.filter(u => u.joinDate && new Date(u.joinDate) >= date && new Date(u.joinDate) < monthEnd).length;
        const monthCommissions = allCommissions.filter(c => c.createdAt && new Date(c.createdAt) >= date && new Date(c.createdAt) < monthEnd)
          .reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);

        dataPoints.push({
          label: date.toLocaleDateString("en-IN", { month: "short" }),
          members: monthMembers,
          commissions: monthCommissions,
        });
      }
    }

    return dataPoints;
  }),
});
