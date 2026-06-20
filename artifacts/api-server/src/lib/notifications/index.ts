import { db } from "@workspace/db";
import {
  notificationsTable,
  notificationDeliveriesTable,
  type Shipment,
  type TrackingEvent,
} from "@workspace/db";
import { logger } from "../logger";
import { renderStatusMessage, getStatusCopy } from "./templates";
import { sendEmail, sendSms, type SendResult } from "./providers";

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "https://shipfast.app";

interface Audience {
  audience: "sender" | "recipient";
  name: string;
  email: string;
  phone: string;
}

/**
 * Notify all parties on a shipment that its status has changed. Sends an email
 * and SMS to both sender and recipient, records an in-app notification, and
 * writes an audit row per dispatch. Never throws — notification failures must
 * not roll back a status update.
 */
export async function notifyStatusChange(
  shipment: Shipment,
  event: Pick<TrackingEvent, "id" | "status" | "location" | "description">,
): Promise<void> {
  try {
    const copy = getStatusCopy(event.status);
    const trackingUrl = `${PUBLIC_BASE_URL.replace(/\/$/, "")}/track/${shipment.trackingNumber}`;

    // 1. In-app notification (one per status change).
    await db.insert(notificationsTable).values({
      type: event.status === "delivered" ? "delivery_alert" : "shipment_update",
      title: `${copy.label} — ${shipment.trackingNumber}`,
      message: `${copy.headline}. ${event.location ? `Location: ${event.location}.` : ""}`.trim(),
      shipmentId: shipment.id,
      read: false,
    });

    // 2. Outbound email + SMS to sender and recipient.
    const audiences: Audience[] = [
      {
        audience: "recipient",
        name: shipment.recipientName,
        email: shipment.recipientEmail,
        phone: shipment.recipientPhone,
      },
      {
        audience: "sender",
        name: shipment.senderName,
        email: shipment.senderEmail,
        phone: shipment.senderPhone,
      },
    ];

    for (const target of audiences) {
      const message = renderStatusMessage({
        shipment,
        status: event.status,
        location: event.location,
        description: event.description,
        recipientName: target.name,
        trackingUrl,
      });

      const emailResult = await sendEmail({
        to: target.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      await recordDelivery(shipment, event, target, "email", target.email, emailResult);

      const smsResult = await sendSms({ to: target.phone, body: message.sms });
      await recordDelivery(shipment, event, target, "sms", target.phone, smsResult);
    }
  } catch (err) {
    // Swallow: a notification problem should never break the status update.
    logger.error(
      { err, shipmentId: shipment.id, status: event.status },
      "notifyStatusChange failed",
    );
  }
}

async function recordDelivery(
  shipment: Shipment,
  event: Pick<TrackingEvent, "id" | "status">,
  target: Audience,
  channel: "email" | "sms",
  destination: string,
  result: SendResult,
): Promise<void> {
  const status = result.skipped ? "skipped" : result.ok ? "sent" : "failed";
  try {
    await db.insert(notificationDeliveriesTable).values({
      shipmentId: shipment.id,
      trackingEventId: event.id ?? null,
      channel,
      status,
      audience: target.audience,
      destination,
      shipmentStatus: event.status,
      provider: result.provider,
      providerMessageId: result.messageId ?? null,
      error: result.error ?? null,
    });
  } catch (err) {
    logger.error({ err, shipmentId: shipment.id, channel }, "failed to record delivery");
  }

  if (status === "failed") {
    logger.warn(
      { shipmentId: shipment.id, channel, destination, error: result.error },
      "notification dispatch failed",
    );
  }
}
