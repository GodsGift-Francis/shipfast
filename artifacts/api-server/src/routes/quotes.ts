import { Router } from "express";
import { db } from "@workspace/db";
import { quotesTable, shipmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateQuoteBody, GetQuoteParams, AcceptQuoteParams } from "@workspace/api-zod";
import { rateShipment } from "../services/rateEngine";

const router = Router();

function calcQuote(
  serviceType: string,
  weight: number,
  originCountry: string,
  destCountry: string,
  dimensions?: string | null,
): { cost: number; days: number } {
  const r = rateShipment({ serviceType, weight, originCountry, destinationCountry: destCountry, dimensions });
  return { cost: r.cost, days: r.days };
}

router.get("/", async (_req, res) => {
  const quotes = await db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt));
  res.json(quotes.map(formatQuote));
});

router.post("/", async (req, res) => {
  const parsed = CreateQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const { cost, days } = calcQuote(data.serviceType, Number(data.weight), data.originCountry, data.destinationCountry, data.dimensions);

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  const [quote] = await db.insert(quotesTable).values({
    status: "active",
    serviceType: data.serviceType,
    originCity: data.originCity,
    originCountry: data.originCountry,
    destinationCity: data.destinationCity,
    destinationCountry: data.destinationCountry,
    weight: String(data.weight),
    dimensions: data.dimensions ?? null,
    estimatedCost: String(cost),
    currency: "USD",
    estimatedDays: days,
    validUntil,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone ?? null,
    notes: data.notes ?? null,
    customerId: data.customerId ?? null,
  }).returning();

  res.status(201).json(formatQuote(quote));
});

router.get("/:id", async (req, res) => {
  const parsed = GetQuoteParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [quote] = await db.select().from(quotesTable).where(eq(quotesTable.id, parsed.data.id));
  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  res.json(formatQuote(quote));
});

router.post("/:id/accept", async (req, res) => {
  const parsed = AcceptQuoteParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [quote] = await db.select().from(quotesTable).where(eq(quotesTable.id, parsed.data.id));
  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  // Mark quote as accepted
  await db.update(quotesTable).set({ status: "accepted" }).where(eq(quotesTable.id, quote.id));

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + quote.estimatedDays);

  // Create a shipment from the quote
  const trackingNum = `SHF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  const [shipment] = await db.insert(shipmentsTable).values({
    trackingNumber: trackingNum,
    serviceType: quote.serviceType,
    originAddress: `${quote.originCity}, ${quote.originCountry}`,
    originCity: quote.originCity,
    originCountry: quote.originCountry,
    destinationAddress: `${quote.destinationCity}, ${quote.destinationCountry}`,
    destinationCity: quote.destinationCity,
    destinationCountry: quote.destinationCountry,
    senderName: quote.contactName,
    senderEmail: quote.contactEmail,
    senderPhone: quote.contactPhone ?? "",
    recipientName: quote.contactName,
    recipientEmail: quote.contactEmail,
    recipientPhone: quote.contactPhone ?? "",
    weight: quote.weight,
    dimensions: quote.dimensions,
    shippingCost: quote.estimatedCost,
    currency: quote.currency,
    notes: quote.notes,
    customerId: quote.customerId,
    estimatedDelivery,
    status: "pending",
  }).returning();

  res.json(formatShipment(shipment));
});

function formatQuote(q: any) {
  return {
    id: q.id,
    status: q.status,
    serviceType: q.serviceType,
    originCity: q.originCity,
    originCountry: q.originCountry,
    destinationCity: q.destinationCity,
    destinationCountry: q.destinationCountry,
    weight: Number(q.weight),
    dimensions: q.dimensions,
    estimatedCost: Number(q.estimatedCost),
    currency: q.currency,
    estimatedDays: q.estimatedDays,
    validUntil: q.validUntil?.toISOString() ?? new Date().toISOString(),
    contactName: q.contactName,
    contactEmail: q.contactEmail,
    contactPhone: q.contactPhone,
    notes: q.notes,
    customerId: q.customerId,
    createdAt: q.createdAt?.toISOString() ?? new Date().toISOString(),
  };
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

export default router;
