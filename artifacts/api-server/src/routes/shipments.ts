import { Router } from "express";
import { db } from "@workspace/db";
import {
  shipmentsTable,
  trackingEventsTable,
  customersTable,
} from "@workspace/db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import {
  ListShipmentsQueryParams,
  CreateShipmentBody,
  UpdateShipmentBody,
  GetShipmentParams,
  UpdateShipmentParams,
  CancelShipmentParams,
  type ListShipmentsQuery,
} from "@workspace/api-zod";
import { applyStatusChange } from "../services/shipmentStatus";
import { notifyStatusChange } from "../lib/notifications";

const router = Router();

function generateTrackingNumber(): string {
  const prefix = "SHF";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function calcShippingCost(serviceType: string, weight: number): number {
  const rates: Record<string, number> = {
    standard: 5.5,
    express: 12.0,
    overnight: 28.0,
    freight: 2.5,
    international: 18.0,
  };
  const baseRate = rates[serviceType] ?? 5.5;
  return Math.round(baseRate * Math.max(weight, 1) * 100) / 100;
}

function calcEstimatedDelivery(serviceType: string): Date {
  const days: Record<string, number> = {
    standard: 5,
    express: 2,
    overnight: 1,
    freight: 10,
    international: 14,
  };
  const d = new Date();
  d.setDate(d.getDate() + (days[serviceType] ?? 5));
  return d;
}

router.get("/", async (req, res) => {
  const parsed = ListShipmentsQueryParams.safeParse(req.query);
  const params: Partial<ListShipmentsQuery> = parsed.success ? parsed.data : {};

  const { status, customerId, search, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(shipmentsTable.status, status as any));
  if (customerId) conditions.push(eq(shipmentsTable.customerId, customerId));
  if (search) {
    conditions.push(
      sql`(${shipmentsTable.trackingNumber} ILIKE ${`%${search}%`} OR ${shipmentsTable.senderName} ILIKE ${`%${search}%`} OR ${shipmentsTable.recipientName} ILIKE ${`%${search}%`})`
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [shipments, countResult] = await Promise.all([
    db.select().from(shipmentsTable).where(where).orderBy(desc(shipmentsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(shipmentsTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    shipments: shipments.map(formatShipment),
    total,
    page,
    limit,
  });
});

router.post("/", async (req, res) => {
  const parsed = CreateShipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const trackingNumber = generateTrackingNumber();
  const shippingCost = calcShippingCost(data.serviceType, Number(data.weight));
  const estimatedDelivery = calcEstimatedDelivery(data.serviceType);

  const [shipment] = await db.insert(shipmentsTable).values({
    trackingNumber,
    serviceType: data.serviceType,
    originAddress: data.originAddress,
    originCity: data.originCity,
    originCountry: data.originCountry,
    destinationAddress: data.destinationAddress,
    destinationCity: data.destinationCity,
    destinationCountry: data.destinationCountry,
    senderName: data.senderName,
    senderEmail: data.senderEmail,
    senderPhone: data.senderPhone,
    recipientName: data.recipientName,
    recipientEmail: data.recipientEmail,
    recipientPhone: data.recipientPhone,
    weight: String(data.weight),
    dimensions: data.dimensions ?? null,
    declaredValue: data.declaredValue != null ? String(data.declaredValue) : null,
    shippingCost: String(shippingCost),
    currency: "USD",
    notes: data.notes ?? null,
    customerId: data.customerId ?? null,
    estimatedDelivery,
    status: "pending",
  }).returning();

  // Add initial tracking event
  const [initialEvent] = await db.insert(trackingEventsTable).values({
    shipmentId: shipment.id,
    status: "pending",
    location: `${data.originCity}, ${data.originCountry}`,
    description: "Shipment booked and awaiting pickup",
    timestamp: new Date(),
  }).returning();

  // Booking confirmation across email / SMS / in-app.
  await notifyStatusChange(shipment, initialEvent);

  // Update customer stats
  if (data.customerId) {
    await db.execute(
      sql`UPDATE customers SET total_shipments = total_shipments + 1, total_spend = total_spend + ${shippingCost} WHERE id = ${data.customerId}`
    );
  }

  res.status(201).json(formatShipment(shipment));
});

router.get("/:id", async (req, res) => {
  const parsed = GetShipmentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [shipment] = await db.select().from(shipmentsTable).where(eq(shipmentsTable.id, parsed.data.id));
  if (!shipment) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  const events = await db.select().from(trackingEventsTable).where(eq(trackingEventsTable.shipmentId, shipment.id)).orderBy(desc(trackingEventsTable.timestamp));

  let customer = null;
  if (shipment.customerId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.id, shipment.customerId));
    customer = c ? formatCustomer(c) : null;
  }

  res.json({
    ...formatShipment(shipment),
    events: events.map(formatEvent),
    customer,
  });
});

router.patch("/:id", async (req, res) => {
  const idParsed = UpdateShipmentParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateShipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Non-status field updates applied alongside any status change.
  const extraUpdates: Record<string, any> = {};
  if (parsed.data.estimatedDelivery) extraUpdates.estimatedDelivery = new Date(parsed.data.estimatedDelivery);
  if (parsed.data.actualDelivery) extraUpdates.actualDelivery = new Date(parsed.data.actualDelivery);
  if (parsed.data.notes !== undefined) extraUpdates.notes = parsed.data.notes;

  // A status change goes through the shared service: it records a tracking
  // event and dispatches email / SMS / in-app notifications when the status
  // actually moves to a new value.
  if (parsed.data.status) {
    const result = await applyStatusChange(idParsed.data.id, {
      status: parsed.data.status,
      extraUpdates,
    });
    if (!result) {
      res.status(404).json({ error: "Shipment not found" });
      return;
    }
    res.json(formatShipment(result.shipment));
    return;
  }

  // No status change — just persist the other fields.
  const [updated] = await db
    .update(shipmentsTable)
    .set({ ...extraUpdates, updatedAt: new Date() })
    .where(eq(shipmentsTable.id, idParsed.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  res.json(formatShipment(updated));
});

router.delete("/:id", async (req, res) => {
  const idParsed = CancelShipmentParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const result = await applyStatusChange(idParsed.data.id, {
    status: "cancelled",
    description: "Shipment cancelled",
  });
  if (!result) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  res.json(formatShipment(result.shipment));
});

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

function formatCustomer(c: any) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    address: c.address,
    city: c.city,
    country: c.country,
    tier: c.tier,
    totalShipments: c.totalShipments,
    totalSpend: Number(c.totalSpend),
    createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export default router;
