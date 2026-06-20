import { Router } from "express";
import { db } from "@workspace/db";
import { routesTable } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  const routes = await db.select().from(routesTable);
  res.json(
    routes.map((r) => ({
      id: r.id,
      originCity: r.originCity,
      originCountry: r.originCountry,
      destinationCity: r.destinationCity,
      destinationCountry: r.destinationCountry,
      serviceType: r.serviceType,
      transitDays: r.transitDays,
      basePrice: Number(r.basePrice),
      currency: r.currency,
      active: r.active,
    }))
  );
});

export default router;
