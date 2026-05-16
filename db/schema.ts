import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  bigint,
  boolean,
  json,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// ============================================================
// CORE USERS (Extended from auth system)
// ============================================================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  memberId: varchar("memberId", { length: 20 }).unique(),
  name: varchar("name", { length: 255 }),
  fullName: varchar("fullName", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  passwordHash: varchar("passwordHash", { length: 255 }),
  sponsorId: bigint("sponsorId", { mode: "number", unsigned: true }),
  parentId: bigint("parentId", { mode: "number", unsigned: true }),
  rankId: bigint("rankId", { mode: "number", unsigned: true }).default(1),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE", "PENDING"]).default("PENDING"),
  kycStatus: mysqlEnum("kycStatus", ["PENDING", "SUBMITTED", "VERIFIED", "REJECTED"]).default("PENDING"),
  joinDate: timestamp("joinDate").defaultNow(),
  role: mysqlEnum("role", ["user", "admin", "MEMBER"]).default("MEMBER"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// RANKS
// ============================================================
export const ranks = mysqlTable("ranks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  displayName: varchar("displayName", { length: 50 }).notNull(),
  minDirects: int("minDirects").default(0),
  minTeamSize: int("minTeamSize").default(0),
  minBusinessVolume: decimal("minBusinessVolume", { precision: 12, scale: 2 }).default("0"),
  color: varchar("color", { length: 20 }).default("#2962FF"),
  icon: varchar("icon", { length: 50 }),
  level: int("level").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================
// PACKAGES
// ============================================================
export const packages = mysqlTable("packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  businessVolume: decimal("businessVolume", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  features: json("features"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================
// WALLETS
// ============================================================
export const wallets = mysqlTable("wallets", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["MAIN", "COMMISSION", "BONUS", "REWARD"]).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  lockedBalance: decimal("lockedBalance", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("user_wallet_type_idx").on(table.userId, table.type),
]);

// ============================================================
// WALLET LEDGER
// ============================================================
export const walletLedger = mysqlTable("wallet_ledger", {
  id: serial("id").primaryKey(),
  walletId: bigint("walletId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["CREDIT", "DEBIT"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal("balanceBefore", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }),
  referenceId: varchar("referenceId", { length: 50 }),
  referenceType: mysqlEnum("referenceType", ["COMMISSION", "WITHDRAWAL", "TRANSFER", "BONUS", "PURCHASE", "RE_PURCHASE"]),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => [
  index("ledger_wallet_idx").on(table.walletId),
]);

// ============================================================
// GENEALOGY
// ============================================================
export const genealogy = mysqlTable("genealogy", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  sponsorId: bigint("sponsorId", { mode: "number", unsigned: true }),
  parentId: bigint("parentId", { mode: "number", unsigned: true }),
  level: int("level").default(0),
  path: varchar("path", { length: 500 }),
  teamSize: int("teamSize").default(0),
  directCount: int("directCount").default(0),
  totalBusinessVolume: decimal("totalBusinessVolume", { precision: 12, scale: 2 }).default("0"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("genealogy_path_idx").on(table.path),
  index("genealogy_parent_idx").on(table.parentId),
  index("genealogy_sponsor_idx").on(table.sponsorId),
]);

// ============================================================
// COMMISSIONS
// ============================================================
export const commissions = mysqlTable("commissions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  fromUserId: bigint("fromUserId", { mode: "number", unsigned: true }).notNull(),
  transactionId: bigint("transactionId", { mode: "number", unsigned: true }),
  level: int("level").default(0),
  type: mysqlEnum("type", ["DIRECT", "LEVEL", "BONUS", "REWARD", "LOYALTY"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["PENDING", "PAID", "CANCELLED"]).default("PENDING"),
  createdAt: timestamp("createdAt").defaultNow(),
  paidAt: timestamp("paidAt"),
}, (table) => [
  index("commission_user_idx").on(table.userId),
  index("commission_from_idx").on(table.fromUserId),
]);

// ============================================================
// TRANSACTIONS
// ============================================================
export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["PURCHASE", "RE_PURCHASE", "UPGRADE"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  businessVolume: decimal("businessVolume", { precision: 12, scale: 2 }).default("0"),
  packageId: bigint("packageId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).default("PENDING"),
  gateway: varchar("gateway", { length: 50 }),
  gatewayRef: varchar("gatewayRef", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================
// WITHDRAWALS
// ============================================================
export const withdrawals = mysqlTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 12, scale: 2 }).default("0"),
  netAmount: decimal("netAmount", { precision: 12, scale: 2 }).notNull(),
  method: mysqlEnum("method", ["BANK", "UPI"]).notNull(),
  accountDetails: json("accountDetails"),
  status: mysqlEnum("status", ["PENDING", "APPROVED", "REJECTED", "PROCESSING", "COMPLETED"]).default("PENDING"),
  remarks: varchar("remarks", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
  processedAt: timestamp("processedAt"),
}, (table) => [
  index("withdrawal_user_idx").on(table.userId),
  index("withdrawal_status_idx").on(table.status),
]);

// ============================================================
// COMMISSION SETTINGS
// ============================================================
export const commissionSettings = mysqlTable("commission_settings", {
  id: serial("id").primaryKey(),
  level: int("level").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["PURCHASE", "RE_PURCHASE"]).notNull(),
  isActive: boolean("isActive").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()),
});

// ============================================================
// REWARDS
// ============================================================
export const rewards = mysqlTable("rewards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  criteria: json("criteria").notNull(),
  rewardType: mysqlEnum("rewardType", ["CASH", "PRODUCT", "TRIP"]).notNull(),
  rewardValue: decimal("rewardValue", { precision: 12, scale: 2 }),
  imageUrl: varchar("imageUrl", { length: 255 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================
// USER REWARDS
// ============================================================
export const userRewards = mysqlTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  rewardId: bigint("rewardId", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["ELIGIBLE", "CLAIMED", "DELIVERED"]).default("ELIGIBLE"),
  eligibleAt: timestamp("eligibleAt").defaultNow(),
  claimedAt: timestamp("claimedAt"),
}, (table) => [
  uniqueIndex("user_reward_idx").on(table.userId, table.rewardId),
]);

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["COMMISSION", "WITHDRAWAL", "SYSTEM", "RANK", "REWARD"]).notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => [
  index("notif_user_read_idx").on(table.userId, table.isRead),
]);
