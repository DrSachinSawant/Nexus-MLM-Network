import { getDb } from "../queries/connection";
import { commissions, wallets, walletLedger, genealogy, users, notifications } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

// 7-Level Unilevel Commission Distribution
// Purchase: 10% + 5% + 2.5% + 2.5% + 2% + 2% + 1% = 25%
// Re-Purchase: 5% + 2% + 1% + 1% + 0.5% + 0.25% + 0.25% = 10%

const PURCHASE_RATES = [10, 5, 2.5, 2.5, 2, 2, 1];
const REPURCHASE_RATES = [5, 2, 1, 1, 0.5, 0.25, 0.25];

export async function processCommission(
  transactionId: number,
  userId: number,
  amount: number,
  type: "PURCHASE" | "RE_PURCHASE"
) {
  const db = getDb();

  // Find uplines for this user
  const [userGenealogy] = await db.select().from(genealogy).where(eq(genealogy.userId, userId));

  if (!userGenealogy || !userGenealogy.path) {
    console.warn(`No genealogy found for user ${userId}`);
    return;
  }

  // Parse path to get all ancestors
  const pathParts = userGenealogy.path.split("/").filter(Boolean);
  // Remove the user themselves (last element)
  pathParts.pop();
  // Take up to 7 ancestors (direct to level 6)
  const ancestorIds = pathParts.reverse().slice(0, 7);

  const rates = type === "PURCHASE" ? PURCHASE_RATES : REPURCHASE_RATES;

  for (let i = 0; i < ancestorIds.length; i++) {
    const ancestorId = parseInt(ancestorIds[i]);
    const rate = rates[i];
    if (!rate || rate <= 0) continue;

    const commissionAmount = (amount * rate) / 100;

    // Check if ancestor is active
    const [ancestor] = await db.select().from(users).where(eq(users.id, ancestorId));
    if (!ancestor || ancestor.status !== "ACTIVE") continue;

    // Find commission wallet
    const [commWallet] = await db.select().from(wallets)
      .where(and(eq(wallets.userId, ancestorId), eq(wallets.type, "COMMISSION")));

    if (!commWallet) continue;

    const currentBalance = parseFloat(commWallet.balance?.toString() || "0");
    const newBalance = currentBalance + commissionAmount;

    // Update wallet
    await db.update(wallets)
      .set({ balance: newBalance.toFixed(2) })
      .where(eq(wallets.id, commWallet.id));

    // Create ledger entry
    await db.insert(walletLedger).values({
      walletId: commWallet.id,
      type: "CREDIT",
      amount: commissionAmount.toFixed(2),
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      description: `${type === "PURCHASE" ? "Purchase" : "Re-purchase"} commission from Level ${i} (${rate}%)`,
      referenceId: transactionId.toString(),
      referenceType: "COMMISSION",
    });

    // Create commission record
    await db.insert(commissions).values({
      userId: ancestorId,
      fromUserId: userId,
      transactionId,
      level: i,
      type: i === 0 ? "DIRECT" : "LEVEL",
      amount: commissionAmount.toFixed(2),
      percentage: rate.toFixed(2),
      status: "PAID",
      paidAt: new Date(),
    });

    // Create notification
    await db.insert(notifications).values({
      userId: ancestorId,
      title: "Commission Earned!",
      message: `You earned Rs. ${commissionAmount.toFixed(2)} from ${type === "PURCHASE" ? "purchase" : "re-purchase"} commission (Level ${i}, ${rate}%)`,
      type: "COMMISSION",
    });
  }

  // Update genealogy stats for the transaction user
  if (userGenealogy.sponsorId) {
    await updateTeamStats(userGenealogy.sponsorId, amount);
  }
}

async function updateTeamStats(userId: number, businessVolume: number) {
  const db = getDb();

  // Recursively update team stats up the chain
  const [userGenealogy] = await db.select().from(genealogy).where(eq(genealogy.userId, userId));
  if (!userGenealogy) return;

  const newTeamSize = (userGenealogy.teamSize || 0) + 1;
  const newBV = parseFloat(userGenealogy.totalBusinessVolume?.toString() || "0") + businessVolume;

  await db.update(genealogy)
    .set({
      teamSize: newTeamSize,
      totalBusinessVolume: newBV.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(genealogy.userId, userId));

  // Continue up the chain
  if (userGenealogy.sponsorId) {
    await updateTeamStats(userGenealogy.sponsorId, businessVolume);
  }
}

export async function getCommissionSummary(userId: number, period?: string) {
  const db = getDb();

  const allCommissions = await db.select().from(commissions)
    .where(eq(commissions.userId, userId))
    .orderBy(desc(commissions.createdAt));

  let filtered = allCommissions;
  if (period === "month") {
    const now = new Date();
    filtered = allCommissions.filter(c => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (period === "week") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filtered = allCommissions.filter(c => {
      if (!c.createdAt) return false;
      return new Date(c.createdAt) >= weekAgo;
    });
  }

  const totalDirect = filtered.filter(c => c.type === "DIRECT").reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);
  const totalLevel = filtered.filter(c => c.type === "LEVEL").reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);
  const totalBonus = filtered.filter(c => c.type === "BONUS").reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);
  const pendingAmount = allCommissions.filter(c => c.status === "PENDING").reduce((sum, c) => sum + parseFloat(c.amount?.toString() || "0"), 0);

  return {
    totalDirect,
    totalLevel,
    totalBonus,
    pendingAmount,
    totalEarnings: totalDirect + totalLevel + totalBonus,
    commissionCount: filtered.length,
  };
}
