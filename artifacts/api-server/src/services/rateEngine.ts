// Professional shipping rate engine.
//
// Replaces the previous flat `baseRate * weight` model with the factors real
// carriers price on: dimensional (volumetric) weight, an origin/destination zone
// multiplier, a per-service base fee + per-kg rate, and a fuel surcharge. Pure
// and deterministic so it can be unit-tested without a database.

export type ServiceType = "standard" | "express" | "overnight" | "freight" | "international";

interface ServiceRate {
  baseFee: number; // flat handling fee, USD
  perKg: number; // USD per billable kg
  days: number; // base transit days (domestic)
}

const SERVICE_RATES: Record<ServiceType, ServiceRate> = {
  standard: { baseFee: 4.0, perKg: 1.8, days: 5 },
  express: { baseFee: 9.0, perKg: 3.5, days: 2 },
  overnight: { baseFee: 18.0, perKg: 6.0, days: 1 },
  freight: { baseFee: 30.0, perKg: 0.9, days: 10 },
  international: { baseFee: 14.0, perKg: 4.5, days: 9 },
};

// cm³ per kg — standard air-freight dimensional divisor.
const DIM_DIVISOR = 5000;
// Minimum billable charge, USD.
const MIN_CHARGE = 6.5;

function fuelSurchargePct(): number {
  const env = Number(process.env.FUEL_SURCHARGE_PCT);
  return Number.isFinite(env) && env >= 0 ? env / 100 : 0.16;
}

export interface RateInput {
  serviceType: string;
  weight: number; // actual weight, kg
  originCountry: string;
  destinationCountry: string;
  dimensions?: string | null; // "LxWxH" in cm, e.g. "50x40x30"
}

export interface RateBreakdown {
  actualWeight: number;
  dimensionalWeight: number;
  billableWeight: number;
  baseFee: number;
  weightCharge: number;
  zoneMultiplier: number;
  fuelSurcharge: number;
  cost: number;
  currency: "USD";
  days: number;
}

/** Parse a "LxWxH" (cm) string into dimensional weight (kg). Returns 0 if unparseable. */
export function dimensionalWeight(dimensions?: string | null): number {
  if (!dimensions) return 0;
  const parts = dimensions
    .split(/[x×*]/i)
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (parts.length !== 3) return 0;
  const volume = parts[0] * parts[1] * parts[2];
  return Math.round((volume / DIM_DIVISOR) * 100) / 100;
}

/** Zone multiplier from origin/destination. Same country is domestic (1.0). */
export function zoneMultiplier(originCountry: string, destinationCountry: string): number {
  const o = (originCountry ?? "").trim().toLowerCase();
  const d = (destinationCountry ?? "").trim().toLowerCase();
  if (!o || !d) return 1.0;
  return o === d ? 1.0 : 1.35;
}

export function rateShipment(input: RateInput): RateBreakdown {
  const service = SERVICE_RATES[(input.serviceType as ServiceType)] ?? SERVICE_RATES.standard;
  const actualWeight = Math.max(Number(input.weight) || 0, 0);
  const dimWeight = dimensionalWeight(input.dimensions);
  const billableWeight = Math.max(actualWeight, dimWeight, 1);

  const zone = zoneMultiplier(input.originCountry, input.destinationCountry);
  const fuelPct = fuelSurchargePct();

  const baseFee = service.baseFee;
  const weightCharge = billableWeight * service.perKg;
  const preSurcharge = (baseFee + weightCharge) * zone;
  const fuelSurcharge = preSurcharge * fuelPct;
  const rawCost = preSurcharge + fuelSurcharge;
  const cost = Math.max(Math.round(rawCost * 100) / 100, MIN_CHARGE);

  const isInternational = zone > 1.0;
  const days = service.days + (isInternational ? 3 : 0);

  return {
    actualWeight,
    dimensionalWeight: dimWeight,
    billableWeight,
    baseFee,
    weightCharge: Math.round(weightCharge * 100) / 100,
    zoneMultiplier: zone,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    cost,
    currency: "USD",
    days,
  };
}
