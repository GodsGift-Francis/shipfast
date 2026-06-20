import { Router } from "express";
import { db } from "@workspace/db";
import { shipmentsTable, trackingEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { TrackPackageParams, ListTrackingEventsParams, AddTrackingEventParams, AddTrackingEventBody, type IdParam } from "@workspace/api-zod";
import { applyStatusChange } from "../services/shipmentStatus";

const router = Router();

router.get("/:trackingNumber", async (req, res) => {
  const parsed = TrackPackageParams.safeParse({ trackingNumber: req.params.trackingNumber });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tracking number" });
    return;
  }

  const [shipment] = await db.select().from(shipmentsTable).where(eq(shipmentsTable.trackingNumber, parsed.data.trackingNumber));
  if (!shipment) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  const events = await db.select().from(trackingEventsTable).where(eq(trackingEventsTable.shipmentId, shipment.id)).orderBy(desc(trackingEventsTable.timestamp));

  res.json({
    shipment: formatShipment(shipment),
    events: events.map(formatEvent),
  });
});

export function createEventsRouter() {
  const eventsRouter = Router({ mergeParams: true });

  eventsRouter.get("/", async (req, res) => {
    const parsed = ListTrackingEventsParams.safeParse({ id: Number((req.params as { id: string }).id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const events = await db.select().from(trackingEventsTable).where(eq(trackingEventsTable.shipmentId, (parsed.data as IdParam).id)).orderBy(desc(trackingEventsTable.timestamp));
    res.json(events.map(formatEvent));
  });

  eventsRouter.post("/", async (req, res) => {
    const idParsed = AddTrackingEventParams.safeParse({ id: Number((req.params as { id: string }).id) });
    if (!idParsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const parsed = AddTrackingEventBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    // applyStatusChange records the event, syncs the shipment status when the
    // event status is a known value, and fires notifications on a real
    // transition — all in one place.
    const result = await applyStatusChange((idParsed.data as IdParam).id, {
      status: parsed.data.status,
      location: parsed.data.location,
      description: parsed.data.description,
      timestamp: parsed.data.timestamp ? new Date(parsed.data.timestamp) : undefined,
    });

    if (!result) {
      res.status(404).json({ error: "Shipment not found" });
      return;
    }

    res.status(201).json(formatEvent(result.event));
  });

  return eventsRouter;
}

function formatShipment(s: any) {
  return {
    id: s.id,
    trackingNumber: s.trackingNumber,
    status: s.status,
    serviceType: s.serviceType,
    originAddress: s.originAddress,
    originCity: s.originCity,
    originCountry: s.originCountry,
    destinationAddress: s.destinationAddress,
    destinationCity: s.destinationCity,
    destinationCountry: s.destinationCountry,
    senderName: s.senderName,
    senderEmail: s.senderEmail,
    senderPhone: s.senderPhone,
    recipientName: s.recipientName,
    recipientEmail: s.recipientEmail,
    recipientPhone: s.recipientPhone,
    weight: Number(s.weight),
    dimensions: s.dimensions,
    declaredValue: s.declaredValue != null ? Number(s.declaredValue) : null,
    shippingCost: Number(s.shippingCost),
    currency: s.currency,
    notes: s.notes,
    customerId: s.customerId,
    estimatedDelivery: s.estimatedDelivery?.toISOString() ?? new Date().toISOString(),
    actualDelivery: s.actualDelivery?.toISOString() ?? null,
    createdAt: s.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: s.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function formatEvent(e: any) {
  return {
    id: e.id,
    shipmentId: e.shipmentId,
    status: e.status,
    location: e.location,
    description: e.description,
    timestamp: e.timestamp?.toISOString() ?? new Date().toISOString(),
  };
}

export default router;
