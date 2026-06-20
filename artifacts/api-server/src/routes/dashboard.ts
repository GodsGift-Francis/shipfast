import { Router } from "express";
import { db } from "@workspace/db";
import { shipmentsTable, customersTable, invoicesTable, trackingEventsTable } from "@workspace/db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (_req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalResult,
    activeResult,
    deliveredTodayResult,
    pendingResult,
    totalRevenueResult,
    monthlyRevenueResult,
    totalCustomersResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(shipmentsTable),
    db.select({ count: sql<number>`count(*)` }).from(shipmentsTable).where(
      sql`${shipmentsTable.status} IN ('processing', 'in_transit', 'out_for_delivery')`
    ),
    db.select({ count: sql<number>`count(*)` }).from(shipmentsTable).where(
      and(eq(shipmentsTable.status, "delivered"), gte(shipmentsTable.updatedAt, todayStart))
    ),
    db.select({ count: sql<number>`count(*)` }).from(shipmentsTable).where(eq(shipmentsTable.status, "pending")),
    db.select({ total: sql<number>`COALESCE(SUM(shipping_cost::numeric), 0)` }).from(shipmentsTable),
    db.select({ total: sql<number>`COALESCE(SUM(shipping_cost::numeric), 0)` }).from(shipmentsTable).where(gte(shipmentsTable.createdAt, monthStart)),
    db.select({ count: sql<number>`count(*)` }).from(customersTable),
  ]);

  res.json({
    totalShipments: Number(totalResult[0]?.count ?? 0),
    activeShipments: Number(activeResult[0]?.count ?? 0),
    deliveredToday: Number(deliveredTodayResult[0]?.count ?? 0),
    pendingPickup: Number(pendingResult[0]?.count ?? 0),
    totalRevenue: Number(totalRevenueResult[0]?.total ?? 0),
    monthlyRevenue: Number(monthlyRevenueResult[0]?.total ?? 0),
    totalCustomers: Number(totalCustomersResult[0]?.count ?? 0),
    avgDeliveryTime: 3.4,
  });
});

router.get("/activity", async (req, res) => {
  const parsed = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

  const recentShipments = await db
    .select()
    .from(shipmentsTable)
    .orderBy(desc(shipmentsTable.updatedAt))
    .limit(limit);

  const activities = recentShipments.map((s, i) => ({
    id: s.id,
    type: s.status === "delivered" ? "delivered" : s.status === "pending" ? "shipment_created" : "status_update",
    title:
      s.status === "delivered"
        ? "Package Delivered"
        : s.status === "pending"
        ? "New Shipment Booked"
        : `Shipment ${s.status.replace(/_/g, " ")}`,
    description: `${s.trackingNumber} — ${s.originCity} → ${s.destinationCity}`,
    timestamp: s.updatedAt?.toISOString() ?? new Date().toISOString(),
    trackingNumber: s.trackingNumber,
    status: s.status,
  }));

  res.json(activities);
});

router.get("/shipments-by-status", async (_req, res) => {
  const rows = await db
    .select({ status: shipmentsTable.status, count: sql<number>`count(*)` })
    .from(shipmentsTable)
    .groupBy(shipmentsTable.status);

  res.json(rows.map((r) => ({ status: r.status, count: Number(r.count) })));
});

router.get("/revenue-trend", async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
      COALESCE(SUM(shipping_cost::numeric), 0) AS revenue,
      COUNT(*) AS shipments
    FROM shipments
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `);

  const trend = (rows.rows as any[]).map((r) => ({
    month: r.month,
    revenue: Number(r.revenue),
    shipments: Number(r.shipments),
  }));

  res.json(trend);
});

export default router;
