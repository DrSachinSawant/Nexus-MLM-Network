import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, wallets, genealogy, ranks, packages, notifications } from "@db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Simple hash function (in production, use bcrypt)
function hashPassword(password: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(password + "nexus_salt").digest("hex");
}

function generateMemberId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `NEX-${year}-${random}`;
}

export const localAuthRouter = createRouter({
  register: publicQuery.input(z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    password: z.string().min(6).max(100),
    sponsorId: z.string().optional(),
    packageId: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();

    // Check if email exists
    const [existing] = await db.select().from(users).where(eq(users.email, input.email));
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
    }

    // Find sponsor
    let sponsorUserId: number | null = null;
    if (input.sponsorId) {
      const [sponsor] = await db.select().from(users).where(eq(users.memberId, input.sponsorId));
      if (sponsor) sponsorUserId = sponsor.id;
    }

    // Find default package
    let packageId = input.packageId;
    if (!packageId) {
      const [defaultPkg] = await db.select().from(packages).limit(1);
      packageId = defaultPkg?.id;
    }

    // Create user
    const passwordHash = hashPassword(input.password);
    const memberId = generateMemberId();

    const [user] = await db.insert(users).values({
      unionId: `local_${memberId}`,
      memberId,
      name: input.fullName,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      sponsorId: sponsorUserId,
      parentId: sponsorUserId,
      rankId: 1, // New Member
      role: "MEMBER",
      status: "ACTIVE",
      kycStatus: "PENDING",
    });

    const userId = Number(user.insertId);

    // Create genealogy
    if (sponsorUserId) {
      const [sponsorGen] = await db.select().from(genealogy).where(eq(genealogy.userId, sponsorUserId));
      const path = sponsorGen ? `${sponsorGen.path}${userId}/` : `${sponsorUserId}/${userId}/`;
      const level = (sponsorGen?.level || 0) + 1;

      await db.insert(genealogy).values({
        userId,
        sponsorId: sponsorUserId,
        parentId: sponsorUserId,
        level,
        path,
        teamSize: 0,
        directCount: 0,
        totalBusinessVolume: "0",
      });

      // Update sponsor's direct count
      if (sponsorGen) {
        await db.update(genealogy)
          .set({ directCount: (sponsorGen.directCount || 0) + 1 })
          .where(eq(genealogy.userId, sponsorUserId));
      }
    } else {
      await db.insert(genealogy).values({
        userId,
        level: 0,
        path: `${userId}/`,
        teamSize: 0,
        directCount: 0,
        totalBusinessVolume: "0",
      });
    }

    // Create wallets
    for (const wtype of ["MAIN", "COMMISSION", "BONUS", "REWARD"] as const) {
      await db.insert(wallets).values({
        userId,
        type: wtype,
        balance: "0",
      });
    }

    // Send welcome notification
    await db.insert(notifications).values({
      userId,
      title: "Welcome to Nexus Network!",
      message: `Your account has been created successfully. Your Member ID is ${memberId}. Complete your KYC to start earning!`,
      type: "SYSTEM",
    });

    return { success: true, memberId, message: "Registration successful" };
  }),

  login: publicQuery.input(z.object({
    memberId: z.string(),
    password: z.string(),
  })).mutation(async ({ input }) => {
    const db = getDb();

    const [user] = await db.select().from(users)
      .where(eq(users.memberId, input.memberId));

    if (!user || !user.passwordHash) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    const passwordHash = hashPassword(input.password);
    if (user.passwordHash !== passwordHash) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    // Update last sign in
    await db.update(users)
      .set({ lastSignInAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      success: true,
      user: {
        id: user.id,
        memberId: user.memberId,
        name: user.name || user.fullName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        kycStatus: user.kycStatus,
        rankId: user.rankId,
      },
    };
  }),

  me: publicQuery.query(async ({ ctx }) => {
    const db = getDb();

    // Check for local auth header first
    const localMemberId = (ctx.req.headers.get("x-local-member-id") || "").toString();

    if (localMemberId) {
      const [user] = await db.select().from(users).where(eq(users.memberId, localMemberId));
      if (user) {
        const [rank] = user.rankId ? await db.select().from(ranks).where(eq(ranks.id, user.rankId)) : [null];
        return {
          ...user,
          rankName: rank?.displayName || "New Member",
          rankColor: rank?.color || "#90A4AE",
        };
      }
    }

    // Fall back to OAuth user
    if (ctx.user) {
      const [rank] = ctx.user.rankId ? await db.select().from(ranks).where(eq(ranks.id, ctx.user.rankId)) : [null];
      return {
        ...ctx.user,
        rankName: rank?.displayName || "New Member",
        rankColor: rank?.color || "#90A4AE",
      };
    }

    return null;
  }),
});
