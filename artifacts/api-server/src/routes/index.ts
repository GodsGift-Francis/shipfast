import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shipmentsRouter from "./shipments";
import trackingRouter from "./tracking";
import { createEventsRouter } from "./tracking";
import quotesRouter from "./quotes";
import customersRouter from "./customers";
import dashboardRouter from "./dashboard";
import routesHandlerRouter from "./routes-handler";
import notificationsRouter from "./notifications";
import invoicesRouter from "./invoices";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/shipments", shipmentsRouter);
router.use("/shipments/:id/events", createEventsRouter());
router.use("/track", trackingRouter);
router.use("/quotes", quotesRouter);
router.use("/customers", customersRouter);
router.use("/dashboard", dashboardRouter);
router.use("/routes", routesHandlerRouter);
router.use("/notifications", notificationsRouter);
router.use("/invoices", invoicesRouter);

export default router;
