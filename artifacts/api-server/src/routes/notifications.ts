import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const notifications = await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt)).limit(50);
  res.json(
    notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      shipmentId: n.shipmentId ?? null,
      createdAt: n.createdAt?.toISOString() ?? new Date().toISOString(),
    }))
  );
});

router.patch("/:id/read", async (req, res) => {
  const parsed = MarkNotificationReadParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [updated] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, parsed.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json({
    id: updated.id,
    type: updated.type,
    title: updated.title,
    message: updated.message,
    read: updated.read,
    shipmentId: updated.shipmentId ?? null,
    createdAt: updated.createdAt?.toISOString() ?? new Date().toISOString(),
  });
});

export default router;
