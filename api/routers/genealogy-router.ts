import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { genealogy, users, ranks, wallets } from "@db/schema";
import { eq, like } from "drizzle-orm";
import { z } from "zod";

export const genealogyRouter = createRouter({
  getTree: authedQuery.input(z.object({
    userId: z.number().optional(),
    depth: z.number().default(3),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDb();
    const userId = input?.userId || ctx.user.id;
    const depth = input?.depth || 3;

    // Get the root user's genealogy
    const [rootGen] = await db.select().from(genealogy).where(eq(genealogy.userId, userId));
    if (!rootGen) return { root: null, members: [] };

    // Get the root user details
    const [rootUser] = await db.select().from(users).where(eq(users.id, userId));
    const [rootRank] = rootUser?.rankId ? await db.select().from(ranks).where(eq(ranks.id, rootUser.rankId)) : [null];

    // Find all descendants up to given depth
    const pathPrefix = rootGen.path || `${userId}/`;
    const allMembers = await db.select().from(genealogy)
      .where(like(genealogy.path || "", `${pathPrefix}%`));

    // Filter by depth
    const rootLevel = rootGen.level || 0;
    const filteredMembers = allMembers.filter(m => {
      const memberLevel = m.level || 0;
      return memberLevel <= rootLevel + depth && m.userId !== userId;
    });

    // Get user details for all members
    const memberIds = filteredMembers.map(m => m.userId);

    // Build tree structure
    const enrichedMembers = [];
    for (const member of filteredMembers) {
      const [mUser] = await db.select().from(users).where(eq(users.id, member.userId));
      const [mRank] = mUser?.rankId ? await db.select().from(ranks).where(eq(ranks.id, mUser.rankId)) : [null];

      enrichedMembers.push({
        ...member,
        user: mUser ? {
          id: mUser.id,
          memberId: mUser.memberId,
          name: mUser.name || mUser.fullName,
          fullName: mUser.fullName,
          status: mUser.status,
          rank: mRank?.displayName || "New Member",
          rankColor: mRank?.color || "#90A4AE",
          avatar: mUser.avatar,
        } : null,
      });
    }

    return {
      root: rootUser ? {
        id: rootUser.id,
        memberId: rootUser.memberId,
        name: rootUser.name || rootUser.fullName,
        fullName: rootUser.fullName,
        status: rootUser.status,
        rank: rootRank?.displayName || "New Member",
        rankColor: rootRank?.color || "#90A4AE",
        teamSize: rootGen.teamSize,
        directCount: rootGen.directCount,
        totalBusinessVolume: rootGen.totalBusinessVolume,
        avatar: rootUser.avatar,
      } : null,
      members: enrichedMembers,
    };
  }),

  getDownline: authedQuery.input(z.object({
    userId: z.number().optional(),
    level: z.number().optional(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    const db = getDb();
    const userId = input.userId || ctx.user.id;

    const [userGen] = await db.select().from(genealogy).where(eq(genealogy.userId, userId));
    if (!userGen) return { members: [], total: 0 };

    const pathPrefix = userGen.path || `${userId}/`;
    const allDownline = await db.select().from(genealogy)
      .where(like(genealogy.path || "", `${pathPrefix}%`));

    let filtered = allDownline.filter(m => m.userId !== userId);
    if (input.level && input.level > 0) {
      const baseLevel = userGen.level || 0;
      const targetLevel = input.level;
      filtered = filtered.filter(m => (m.level || 0) === baseLevel + targetLevel);
    }

    const total = filtered.length;
    const paginated = filtered.slice(input.offset, input.offset + input.limit);

    const enriched = [];
    for (const member of paginated) {
      const [mUser] = await db.select().from(users).where(eq(users.id, member.userId));
      const [mRank] = mUser?.rankId ? await db.select().from(ranks).where(eq(ranks.id, mUser.rankId)) : [null];

      enriched.push({
        id: member.userId,
        memberId: mUser?.memberId,
        name: mUser?.name || mUser?.fullName || "Unknown",
        status: mUser?.status,
        rank: mRank?.displayName || "New Member",
        rankColor: mRank?.color || "#90A4AE",
        level: member.level,
        teamSize: member.teamSize,
        directCount: member.directCount,
        businessVolume: member.totalBusinessVolume,
        joinDate: mUser?.joinDate,
      });
    }

    return { members: enriched, total };
  }),

  getUpline: authedQuery.input(z.object({
    userId: z.number().optional(),
  })).query(async ({ ctx, input }) => {
    const db = getDb();
    const userId = input.userId || ctx.user.id;

    const [userGen] = await db.select().from(genealogy).where(eq(genealogy.userId, userId));
    if (!userGen || !userGen.path) return [];

    const pathParts = userGen.path.split("/").filter(Boolean);
    pathParts.pop(); // Remove self

    const upline = [];
    for (let i = pathParts.length - 1; i >= 0; i--) {
      const ancestorId = parseInt(pathParts[i]);
      const [ancestor] = await db.select().from(users).where(eq(users.id, ancestorId));
      const [aRank] = ancestor?.rankId ? await db.select().from(ranks).where(eq(ranks.id, ancestor.rankId)) : [null];

      if (ancestor) {
        upline.push({
          id: ancestor.id,
          memberId: ancestor.memberId,
          name: ancestor.name || ancestor.fullName,
          rank: aRank?.displayName || "New Member",
          rankColor: aRank?.color || "#90A4AE",
          level: pathParts.length - i,
        });
      }
    }

    return upline;
  }),

  getMemberDetails: authedQuery.input(z.object({
    memberId: z.string(),
  })).query(async ({ input }) => {
    const db = getDb();

    const [member] = await db.select().from(users).where(eq(users.memberId, input.memberId));
    if (!member) return null;

    const [memberRank] = member.rankId ? await db.select().from(ranks).where(eq(ranks.id, member.rankId)) : [null];
    const [memberGen] = await db.select().from(genealogy).where(eq(genealogy.userId, member.id));
    const memberWallets = await db.select().from(wallets).where(eq(wallets.userId, member.id));

    // Get sponsor
    let sponsor = null;
    if (member.sponsorId) {
      const [s] = await db.select().from(users).where(eq(users.id, member.sponsorId));
      sponsor = s ? { name: s.name || s.fullName, memberId: s.memberId } : null;
    }

    return {
      id: member.id,
      memberId: member.memberId,
      name: member.name || member.fullName,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      status: member.status,
      kycStatus: member.kycStatus,
      rank: memberRank?.displayName || "New Member",
      rankColor: memberRank?.color || "#90A4AE",
      joinDate: member.joinDate,
      teamSize: memberGen?.teamSize || 0,
      directCount: memberGen?.directCount || 0,
      businessVolume: memberGen?.totalBusinessVolume || "0",
      wallets: memberWallets.map(w => ({
        type: w.type,
        balance: w.balance,
      })),
      sponsor,
    };
  }),
});
