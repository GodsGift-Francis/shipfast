import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import shipmentsRouter from "./shipments";
import trackingRouter from "./tracking";
import { createEventsRouter } from "./tracking";
import quotesRouter from "./quotes";
import customersRouter from "./customers";
import dashboardRouter from "./dashboard";
import routesHandlerRouter from "./routes-handler";
import notificationsRouter from "./notifications";
import invoicesRouter from "./invoices";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);

router.use("/track", trackingRouter);

router.use("/shipments", requireAuth, shipmentsRouter);
router.use("/shipments/:id/events", requireAuth, createEventsRouter());
router.use("/quotes", quotesRouter);
router.use("/customers", requireAuth, customersRouter);
router.use("/dashboard", requireAuth, dashboardRouter);
router.use("/routes", requireAuth, routesHandlerRouter);
router.use("/notifications", requireAuth, notificationsRouter);
router.use("/invoices", requireAuth, invoicesRouter);

export default router;
