import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, ranks, genealogy, wallets } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const memberRouter = createRouter({
  list: adminQuery.input(z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    rank: z.number().optional(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  })).query(async ({ input }) => {
    const db = getDb();

    const allUsers = await db.select().from(users)
      .orderBy(desc(users.createdAt));

    let filtered = allUsers.filter(u => u.role !== "admin");

    if (input.search) {
      const search = input.search.toLowerCase();
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        u.memberId?.toLowerCase().includes(search) ||
        u.phone?.includes(search)
      );
    }

    if (input.status) {
      filtered = filtered.filter(u => u.status === input.status);
    }

    if (input.rank) {
      filtered = filtered.filter(u => u.rankId === input.rank);
    }

    const total = filtered.length;
    const paginated = filtered.slice(input.offset, input.offset + input.limit);

    // Enrich with rank names
    const enriched = [];
    for (const user of paginated) {
      const [rank] = user.rankId ? await db.select().from(ranks).where(eq(ranks.id, user.rankId)) : [null];
      const [gen] = await db.select().from(genealogy).where(eq(genealogy.userId, user.id));

      enriched.push({
        id: user.id,
        memberId: user.memberId,
        name: user.name || user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        kycStatus: user.kycStatus,
        rank: rank?.displayName || "New Member",
        rankColor: rank?.color || "#90A4AE",
        teamSize: gen?.teamSize || 0,
        joinDate: user.joinDate,
      });
    }

    return { members: enriched, total };
  }),

  getById: adminQuery.input(z.object({
    id: z.number(),
  })).query(async ({ input }) => {
    const db = getDb();

    const [user] = await db.select().from(users).where(eq(users.id, input.id));
    if (!user) return null;

    const [rank] = user.rankId ? await db.select().from(ranks).where(eq(ranks.id, user.rankId)) : [null];
    const [gen] = await db.select().from(genealogy).where(eq(genealogy.userId, user.id));
    const userWallets = await db.select().from(wallets).where(eq(wallets.userId, user.id));

    let sponsor = null;
    if (user.sponsorId) {
      const [s] = await db.select().from(users).where(eq(users.id, user.sponsorId));
      sponsor = s ? { name: s.name || s.fullName, memberId: s.memberId } : null;
    }

    return {
      id: user.id,
      memberId: user.memberId,
      name: user.name || user.fullName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      kycStatus: user.kycStatus,
      rank: rank?.displayName || "New Member",
      rankColor: rank?.color || "#90A4AE",
      joinDate: user.joinDate,
      teamSize: gen?.teamSize || 0,
      directCount: gen?.directCount || 0,
      businessVolume: gen?.totalBusinessVolume || "0",
      wallets: userWallets,
      sponsor,
      createdAt: user.createdAt,
    };
  }),

  updateStatus: adminQuery.input(z.object({
    id: z.number(),
    status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
  })).mutation(async ({ input }) => {
    const db = getDb();

    await db.update(users)
      .set({ status: input.status })
      .where(eq(users.id, input.id));

    return { success: true };
  }),

  updateRank: adminQuery.input(z.object({
    id: z.number(),
    rankId: z.number(),
  })).mutation(async ({ input }) => {
    const db = getDb();

    await db.update(users)
      .set({ rankId: input.rankId })
      .where(eq(users.id, input.id));

    return { success: true };
  }),
});
