import { relations } from "drizzle-orm";
import {
  users,
  ranks,
  wallets,
  walletLedger,
  genealogy,
  commissions,
  transactions,
  withdrawals,
  rewards,
  userRewards,
  notifications,
} from "./schema";

// Users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  sponsor: one(users, {
    fields: [users.sponsorId],
    references: [users.id],
    relationName: "sponsorship",
  }),
  sponsoredUsers: many(users, { relationName: "sponsorship" }),
  rank: one(ranks, {
    fields: [users.rankId],
    references: [ranks.id],
  }),
  wallets: many(wallets),
  commissions: many(commissions, { relationName: "userCommissions" }),
  withdrawals: many(withdrawals),
  genealogy: one(genealogy, {
    fields: [users.id],
    references: [genealogy.userId],
  }),
  userRewards: many(userRewards),
  notifications: many(notifications),
}));

// Ranks relations
export const ranksRelations = relations(ranks, ({ many }) => ({
  users: many(users),
}));

// Wallets relations
export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  ledgerEntries: many(walletLedger),
}));

// Wallet ledger relations
export const walletLedgerRelations = relations(walletLedger, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletLedger.walletId],
    references: [wallets.id],
  }),
}));

// Genealogy relations
export const genealogyRelations = relations(genealogy, ({ one }) => ({
  user: one(users, {
    fields: [genealogy.userId],
    references: [users.id],
  }),
}));

// Commissions relations
export const commissionsRelations = relations(commissions, ({ one }) => ({
  user: one(users, {
    fields: [commissions.userId],
    references: [users.id],
    relationName: "userCommissions",
  }),
}));

// Transactions relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Withdrawals relations
export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

// User rewards relations
export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, {
    fields: [userRewards.userId],
    references: [users.id],
  }),
  reward: one(rewards, {
    fields: [userRewards.rewardId],
    references: [rewards.id],
  }),
}));

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
