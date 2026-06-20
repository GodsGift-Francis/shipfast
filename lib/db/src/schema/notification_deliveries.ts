import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Channel a notification was dispatched over.
export const notificationChannelEnum = pgEnum("notification_channel", ["email", "sms"]);

// Outcome of an outbound dispatch attempt.
export const notificationDeliveryStatusEnum = pgEnum("notification_delivery_status", [
  "sent",
  "failed",
  "skipped",
]);

// Audit log of every outbound email/SMS the system attempts to send when a
// shipment's status changes. One row per channel per recipient per event.
export const notificationDeliveriesTable = pgTable("notification_deliveries", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull(),
  trackingEventId: integer("tracking_event_id"),
  channel: notificationChannelEnum("channel").notNull(),
  status: notificationDeliveryStatusEnum("status").notNull(),
  // "sender" or "recipient" — who the message was addressed to.
  audience: text("audience").notNull(),
  destination: text("destination").notNull(),
  shipmentStatus: text("shipment_status").notNull(),
  provider: text("provider").notNull(),
  providerMessageId: text("provider_message_id"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationDeliverySchema = createInsertSchema(notificationDeliveriesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertNotificationDelivery = z.infer<typeof insertNotificationDeliverySchema>;
export type NotificationDelivery = typeof notificationDeliveriesTable.$inferSelect;
