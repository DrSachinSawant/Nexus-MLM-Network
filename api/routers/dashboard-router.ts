import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { wallets, genealogy, users, commissions, transactions } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { getCommissionSummary } from "../services/commission-engine";

export const dashboardRouter = createRouter({
  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get wallet balances
    const userWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
    const mainWallet = userWallets.find(w => w.type === "MAIN");
    const commissionWallet = userWallets.find(w => w.type === "COMMISSION");

    // Get commission summary
    const commissionSummary = await getCommissionSummary(userId);

    // Get genealogy stats
    const [userGenealogy] = await db.select().from(genealogy).where(eq(genealogy.userId, userId));

    // Get user rank
    const [userData] = await db.select().from(users).where(eq(users.id, userId));

    // Get user rank and genealogy info

    return {
      totalEarnings: commissionSummary.totalEarnings,
      availableBalance: parseFloat(mainWallet?.balance?.toString() || "0"),
      commissionBalance: parseFloat(commissionWallet?.balance?.toString() || "0"),
      directReferrals: userGenealogy?.directCount || 0,
      teamSize: userGenealogy?.teamSize || 0,
      totalBusinessVolume: parseFloat(userGenealogy?.totalBusinessVolume?.toString() || "0"),
      currentRank: userData?.rankId || 1,
      rankProgress: Math.min(100, Math.round(((userGenealogy?.directCount || 0) / 50) * 100)),
      kycStatus: userData?.kycStatus,
      status: userData?.status,
    };
  }),

  getRecentActivity: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get recent commissions
    const recentCommissions = await db.select().from(commissions)
      .where(eq(commissions.userId, userId))
      .orderBy(desc(commissions.createdAt))
      .limit(10);

    // Get recent transactions
    const { transactions } = await import("@db/schema");
    const recentTransactions = await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    return {
      commissions: recentCommissions,
      transactions: recentTransactions,
    };
  }),
});
