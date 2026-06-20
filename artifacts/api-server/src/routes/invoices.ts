import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, customersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { ListInvoicesQueryParams, CreateInvoiceBody, GetInvoiceParams } from "@workspace/api-zod";

const router = Router();

function generateInvoiceNumber(): string {
  const prefix = "INV";
  const year = new Date().getFullYear();
  const seq = Date.now().toString().slice(-6);
  return `${prefix}-${year}-${seq}`;
}

router.get("/", async (req, res) => {
  const parsed = ListInvoicesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const { status, customerId } = params;

  let query = db
    .select({
      invoice: invoicesTable,
      customerName: customersTable.name,
    })
    .from(invoicesTable)
    .leftJoin(customersTable, eq(invoicesTable.customerId, customersTable.id));

  const conditions: any[] = [];
  if (status) conditions.push(eq(invoicesTable.status, status as any));
  if (customerId) conditions.push(eq(invoicesTable.customerId, customerId));

  if (conditions.length) {
    query = query.where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`) as any;
  }

  const rows = await (query as any).orderBy(desc(invoicesTable.createdAt));
  res.json(rows.map(({ invoice, customerName }: any) => formatInvoice(invoice, customerName)));
});

router.post("/", async (req, res) => {
  const parsed = CreateInvoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const invoiceNumber = generateInvoiceNumber();

  const [invoice] = await db.insert(invoicesTable).values({
    invoiceNumber,
    status: "draft",
    customerId: data.customerId,
    amount: String(data.amount),
    currency: data.currency ?? "USD",
    shipmentIds: JSON.stringify(data.shipmentIds ?? []),
    dueDate: new Date(data.dueDate),
    notes: data.notes ?? null,
  }).returning();

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, data.customerId));
  res.status(201).json(formatInvoice(invoice, customer?.name ?? ""));
});

router.get("/:id", async (req, res) => {
  const parsed = GetInvoiceParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [row] = await db
    .select({ invoice: invoicesTable, customerName: customersTable.name })
    .from(invoicesTable)
    .leftJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
    .where(eq(invoicesTable.id, parsed.data.id));

  if (!row) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  res.json(formatInvoice(row.invoice, row.customerName ?? ""));
});

function formatInvoice(inv: any, customerName: string) {
  let shipmentIds: number[] = [];
  try {
    shipmentIds = JSON.parse(inv.shipmentIds ?? "[]");
  } catch {}

  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    customerId: inv.customerId,
    customerName: customerName ?? "",
    amount: Number(inv.amount),
    currency: inv.currency,
    shipmentIds,
    dueDate: inv.dueDate?.toISOString() ?? new Date().toISOString(),
    paidAt: inv.paidAt?.toISOString() ?? null,
    notes: inv.notes ?? null,
    createdAt: inv.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export default router;
