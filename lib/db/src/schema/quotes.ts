import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteStatusEnum = pgEnum("quote_status", ["pending", "active", "accepted", "expired"]);

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  status: quoteStatusEnum("status").notNull().default("active"),
  serviceType: text("service_type").notNull(),
  originCity: text("origin_city").notNull(),
  originCountry: text("origin_country").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationCountry: text("destination_country").notNull(),
  weight: numeric("weight", { precision: 10, scale: 2 }).notNull(),
  dimensions: text("dimensions"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  estimatedDays: integer("estimated_days").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  notes: text("notes"),
  customerId: integer("customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ id: true, createdAt: true });
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;
