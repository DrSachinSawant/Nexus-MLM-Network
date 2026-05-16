import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { commissions, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { getCommissionSummary } from "../services/commission-engine";

export const commissionRouter = createRouter({
  getSummary: authedQuery.input(z.object({
    period: z.string().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    const period = input?.period || "all";
    return getCommissionSummary(ctx.user.id, period);
  }),

  getHistory: authedQuery.input(z.object({
    type: z.string().optional(),
    level: z.number().optional(),
    status: z.string().optional(),
    limit: z.number().default(20),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    const db = getDb();

    const allCommissions = await db.select().from(commissions)
      .where(eq(commissions.userId, ctx.user.id))
      .orderBy(desc(commissions.createdAt));

    let filtered = allCommissions;
    if (input.type) {
      filtered = filtered.filter(c => c.type === input.type);
    }
    if (input.level !== undefined) {
      filtered = filtered.filter(c => c.level === input.level);
    }
    if (input.status) {
      filtered = filtered.filter(c => c.status === input.status);
    }

    const total = filtered.length;
    const paginated = filtered.slice(input.offset, input.offset + input.limit);

    // Enrich with member names
    const enriched = [];
    for (const c of paginated) {
      const [fromUser] = await db.select().from(users).where(eq(users.id, c.fromUserId));
      enriched.push({
        ...c,
        fromMemberName: fromUser?.name || fromUser?.fullName || "Unknown",
        fromMemberId: fromUser?.memberId,
      });
    }

    return { commissions: enriched, total };
  }),

  getByLevel: authedQuery.input(z.object({
    level: z.number(),
  })).query(async ({ ctx, input }) => {
    const db = getDb();

    const levelCommissions = await db.select().from(commissions)
      .where(and(
        eq(commissions.userId, ctx.user.id),
        eq(commissions.level, input.level)
      ))
      .orderBy(desc(commissions.createdAt));

    const total = levelCommissions.reduce((sum, c) =>
      sum + parseFloat(c.amount?.toString() || "0"), 0);

    return { commissions: levelCommissions, total };
  }),
});
