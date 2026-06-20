import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { CreateCustomerBody, ListCustomersQueryParams, GetCustomerParams, UpdateCustomerParams, UpdateCustomerBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListCustomersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const { search, page = 1 } = params;
  const limit = 50;
  const offset = (page - 1) * limit;

  let query = db.select().from(customersTable);
  if (search) {
    query = query.where(
      sql`(${customersTable.name} ILIKE ${`%${search}%`} OR ${customersTable.email} ILIKE ${`%${search}%`} OR ${customersTable.company} ILIKE ${`%${search}%`})`
    ) as any;
  }

  const customers = await (query as any).orderBy(desc(customersTable.createdAt)).limit(limit).offset(offset);
  res.json(customers.map(formatCustomer));
});

router.post("/", async (req, res) => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db.insert(customersTable).values({
    ...parsed.data,
    tier: (parsed.data.tier ?? "standard") as any,
  }).returning();

  res.status(201).json(formatCustomer(customer));
});

router.get("/:id", async (req, res) => {
  const parsed = GetCustomerParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, parsed.data.id));
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(formatCustomer(customer));
});

router.patch("/:id", async (req, res) => {
  const idParsed = UpdateCustomerParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, any> = { updatedAt: new Date() };
  Object.assign(updates, parsed.data);

  const [updated] = await db.update(customersTable).set(updates).where(eq(customersTable.id, idParsed.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(formatCustomer(updated));
});

function formatCustomer(c: any) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? null,
    company: c.company ?? null,
    address: c.address ?? null,
    city: c.city ?? null,
    country: c.country ?? null,
    tier: c.tier,
    totalShipments: c.totalShipments,
    totalSpend: Number(c.totalSpend),
    createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export default router;
