import { getDb } from "../api/queries/connection";
import {
  users, ranks, packages, wallets, genealogy,
  commissionSettings, rewards, commissions, walletLedger,
  withdrawals, notifications, transactions,
} from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  const db = getDb();
  console.log("🌱 Starting seed...");

  // 1. RANKS - Insert ignore
  console.log("🏅 Seeding ranks...");
  await db.insert(ranks).values([
    { name: "NEW_MEMBER", displayName: "New Member", minDirects: 0, minTeamSize: 0, minBusinessVolume: "0", color: "#90A4AE", icon: "star", level: 1 },
    { name: "ASSOCIATE", displayName: "Associate", minDirects: 1, minTeamSize: 0, minBusinessVolume: "0", color: "#5C6BC0", icon: "award", level: 2 },
    { name: "SENIOR_ASSOCIATE", displayName: "Senior Associate", minDirects: 3, minTeamSize: 5, minBusinessVolume: "10000", color: "#42A5F5", icon: "medal", level: 3 },
    { name: "DIRECTOR", displayName: "Director", minDirects: 5, minTeamSize: 10, minBusinessVolume: "50000", color: "#2962FF", icon: "trophy", level: 4 },
    { name: "SENIOR_DIRECTOR", displayName: "Senior Director", minDirects: 10, minTeamSize: 50, minBusinessVolume: "200000", color: "#1E88E5", icon: "crown", level: 5 },
    { name: "EXECUTIVE", displayName: "Executive", minDirects: 25, minTeamSize: 200, minBusinessVolume: "1000000", color: "#7E57C2", icon: "gem", level: 6 },
    { name: "GOLD_DIRECTOR", displayName: "Gold Director", minDirects: 50, minTeamSize: 500, minBusinessVolume: "5000000", color: "#FFC400", icon: "crown", level: 7 },
    { name: "PLATINUM", displayName: "Platinum", minDirects: 100, minTeamSize: 1000, minBusinessVolume: "25000000", color: "#B0BEC5", icon: "diamond", level: 8 },
    { name: "DIAMOND", displayName: "Diamond", minDirects: 200, minTeamSize: 5000, minBusinessVolume: "100000000", color: "#00BCD4", icon: "gem", level: 9 },
    { name: "CROWN_AMBASSADOR", displayName: "Crown Ambassador", minDirects: 500, minTeamSize: 10000, minBusinessVolume: "500000000", color: "#E91E63", icon: "crown", level: 10 },
  ]).onDuplicateKeyUpdate({ set: { name: sql`name` } });

  // 2. PACKAGES
  console.log("📦 Seeding packages...");
  await db.insert(packages).values([
    { name: "Starter", amount: "1999", businessVolume: "1000", description: "Perfect for beginners. Get started with essential tools and training.", features: JSON.stringify(["Basic Training", "Digital Kit", "Community Access"]) },
    { name: "Premium", amount: "4999", businessVolume: "3000", description: "Our most popular package with enhanced benefits and higher earning potential.", features: JSON.stringify(["Advanced Training", "Marketing Materials", "Priority Support", "Weekly Webinars"]) },
    { name: "Elite", amount: "9999", businessVolume: "7000", description: "The ultimate package for serious entrepreneurs. Maximum earning potential.", features: JSON.stringify(["Executive Training", "Done-for-you Marketing", "1-on-1 Mentorship", "VIP Events", "International Trips"]) },
  ]).onDuplicateKeyUpdate({ set: { name: sql`name` } });

  // 3. COMMISSION SETTINGS
  console.log("⚙️ Seeding commission settings...");
  await db.insert(commissionSettings).values([
    { level: 0, percentage: "10.00", type: "PURCHASE" },
    { level: 1, percentage: "5.00", type: "PURCHASE" },
    { level: 2, percentage: "2.50", type: "PURCHASE" },
    { level: 3, percentage: "2.50", type: "PURCHASE" },
    { level: 4, percentage: "2.00", type: "PURCHASE" },
    { level: 5, percentage: "2.00", type: "PURCHASE" },
    { level: 6, percentage: "1.00", type: "PURCHASE" },
    { level: 0, percentage: "5.00", type: "RE_PURCHASE" },
    { level: 1, percentage: "2.00", type: "RE_PURCHASE" },
    { level: 2, percentage: "1.00", type: "RE_PURCHASE" },
    { level: 3, percentage: "1.00", type: "RE_PURCHASE" },
    { level: 4, percentage: "0.50", type: "RE_PURCHASE" },
    { level: 5, percentage: "0.25", type: "RE_PURCHASE" },
    { level: 6, percentage: "0.25", type: "RE_PURCHASE" },
  ]).onDuplicateKeyUpdate({ set: { level: sql`level` } });

  // 4. REWARDS
  console.log("🎁 Seeding rewards...");
  await db.insert(rewards).values([
    { name: "Smart Watch", description: "Premium smartwatch for active distributors", criteria: JSON.stringify({ directReferrals: 10, teamBusiness: 100000 }), rewardType: "PRODUCT", rewardValue: "5000" },
    { name: "Gold Coin", description: "24K gold coin for achieving Director rank", criteria: JSON.stringify({ directReferrals: 50, teamBusiness: 500000 }), rewardType: "PRODUCT", rewardValue: "15000" },
    { name: "Weekend Getaway", description: "Luxury weekend resort stay", criteria: JSON.stringify({ directReferrals: 100, teamBusiness: 2000000 }), rewardType: "TRIP", rewardValue: "50000" },
    { name: "Royal Enfield", description: "Royal Enfield Classic 350", criteria: JSON.stringify({ directReferrals: 200, teamBusiness: 10000000 }), rewardType: "PRODUCT", rewardValue: "200000" },
    { name: "International Trip", description: "7-day Dubai vacation", criteria: JSON.stringify({ directReferrals: 500, teamBusiness: 50000000 }), rewardType: "TRIP", rewardValue: "300000" },
    { name: "Luxury Car", description: "Mercedes-Benz C-Class", criteria: JSON.stringify({ directReferrals: 1000, teamBusiness: 200000000 }), rewardType: "PRODUCT", rewardValue: "5000000" },
  ]).onDuplicateKeyUpdate({ set: { name: sql`name` } });

  console.log("✅ Seed completed!");
}

seed().catch(console.error);
