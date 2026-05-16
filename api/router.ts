import { authRouter } from "./auth-router";
import { localAuthRouter } from "./routers/local-auth-router";
import { dashboardRouter } from "./routers/dashboard-router";
import { genealogyRouter } from "./routers/genealogy-router";
import { commissionRouter } from "./routers/commission-router";
import { walletRouter } from "./routers/wallet-router";
import { withdrawalRouter } from "./routers/withdrawal-router";
import { notificationRouter } from "./routers/notification-router";
import { memberRouter } from "./routers/member-router";
import { adminRouter } from "./routers/admin-router";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { ranks, packages, commissionSettings, rewards } from "@db/schema";
import { eq } from "drizzle-orm";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  dashboard: dashboardRouter,
  genealogy: genealogyRouter,
  commission: commissionRouter,
  wallet: walletRouter,
  withdrawal: withdrawalRouter,
  notification: notificationRouter,
  member: memberRouter,
  admin: adminRouter,

  // Public data endpoints
  getRanks: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(ranks).orderBy(ranks.level);
  }),

  getPackages: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(packages).where(eq(packages.isActive, true));
  }),

  getCommissionRates: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(commissionSettings);
  }),

  getRewards: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(rewards).where(eq(rewards.isActive, true));
  }),
});

export type AppRouter = typeof appRouter;
