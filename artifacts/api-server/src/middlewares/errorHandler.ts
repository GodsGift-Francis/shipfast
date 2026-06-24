import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = (err as any).status ?? (err as any).statusCode ?? 500;
  const message = err.message || "An unexpected error occurred";

  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");

  if (res.headersSent) return;

  res.status(status).json({
    error: status < 500 ? message : "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { detail: message }),
  });
}
