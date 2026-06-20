import { db } from "@workspace/db";
import {
  shipmentsTable,
  trackingEventsTable,
  shipmentStatusEnum,
  type Shipment,
  type TrackingEvent,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { notifyStatusChange } from "../lib/notifications";
import { getStatusCopy } from "../lib/notifications/templates";

const VALID_STATUSES = new Set<string>(shipmentStatusEnum.enumValues);

export function isShipmentStatus(value: string): boolean {
  return VALID_STATUSES.has(value);
}

export interface StatusChangeInput {
  status: string;
  location?: string;
  description?: string;
  timestamp?: Date;
  // Additional shipment columns to set in the same write (e.g. notes, dates).
  extraUpdates?: Partial<typeof shipmentsTable.$inferInsert>;
}

export interface StatusChangeResult {
  shipment: Shipment;
  event: TrackingEvent;
  statusChanged: boolean;
}

/**
 * The single entry point for moving a shipment to a new status. It:
 *   1. loads the shipment (returns null if it does not exist),
 *   2. records a tracking event documenting the update,
 *   3. syncs the shipment's status column when the status is a known enum value,
 *   4. fires email + SMS + in-app notifications, but only when the status
 *      actually changes to a new value.
 *
 * Both PATCH /shipments/:id and POST /shipments/:id/events route through here so
 * notification behaviour is identical no matter how the status was changed.
 */
export async function applyStatusChange(
  shipmentId: number,
  input: StatusChangeInput,
): Promise<StatusChangeResult | null> {
  const [existing] = await db
    .select()
    .from(shipmentsTable)
    .where(eq(shipmentsTable.id, shipmentId));

  if (!existing) return null;

  const validEnum = isShipmentStatus(input.status);
  const statusChanged = validEnum && input.status !== existing.status;
  const copy = getStatusCopy(input.status);

  // 1. Update the shipment row.
  const updates: Partial<typeof shipmentsTable.$inferInsert> = {
    ...(input.extraUpdates ?? {}),
    updatedAt: new Date(),
  };
  if (validEnum) {
    updates.status = input.status as Shipment["status"];
    // Auto-stamp delivery time when first marked delivered.
    if (input.status === "delivered" && !existing.actualDelivery && !updates.actualDelivery) {
      updates.actualDelivery = input.timestamp ?? new Date();
    }
  }

  const [updated] = await db
    .update(shipmentsTable)
    .set(updates)
    .where(eq(shipmentsTable.id, shipmentId))
    .returning();

  const shipment = updated ?? existing;

  // 2. Record the tracking event.
  const [event] = await db
    .insert(trackingEventsTable)
    .values({
      shipmentId,
      status: input.status,
      location:
        input.location ||
        `${shipment.destinationCity}, ${shipment.destinationCountry}`,
      description: input.description || copy.body,
      timestamp: input.timestamp ?? new Date(),
    })
    .returning();

  // 3. Notify only on a genuine status transition.
  if (statusChanged) {
    await notifyStatusChange(shipment, event);
  }

  return { shipment, event, statusChanged };
}
