import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notifications } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

export const notificationRouter = createRouter({
  getMyNotifications: authedQuery.input(z.object({
    limit: z.number().default(20),
    unreadOnly: z.boolean().default(false),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDb();

    const allNotifications = await db.select().from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt));

    let filtered = allNotifications;
    if (input?.unreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    return filtered.slice(0, input?.limit || 20);
  }),

  markAsRead: authedQuery.input(z.object({
    id: z.number(),
  })).mutation(async ({ input }) => {
    const db = getDb();

    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, input.id));

    return { success: true };
  }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();

    await db.update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));

    return { success: true };
  }),
});
