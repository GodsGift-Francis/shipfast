// Shared shipment-status presentation: labels, ordered lifecycle, and token-based
// colour classes. Keeps Track, ShipmentDetail, and the portal visually consistent.

export const SHIPMENT_STEPS = [
  "pending",
  "processing",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Booked",
  processing: "Processing",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  on_hold: "On hold",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export type StatusTone = "positive" | "active" | "warning" | "neutral";

export function statusTone(status: string): StatusTone {
  if (status === "delivered") return "positive";
  if (status === "cancelled" || status === "on_hold") return "warning";
  if (status === "pending") return "neutral";
  return "active";
}

// Tailwind classes for a status badge/pill, keyed by tone. Uses theme tokens.
export function statusBadgeClass(status: string): string {
  switch (statusTone(status)) {
    case "positive":
      return "bg-[hsl(var(--chart-3)/0.12)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.25)]";
    case "warning":
      return "bg-destructive/10 text-destructive border-destructive/25";
    case "neutral":
      return "bg-muted text-muted-foreground border-border";
    case "active":
    default:
      return "bg-accent/15 text-[hsl(38_82%_38%)] border-accent/30";
  }
}

export function statusDotClass(status: string): string {
  switch (statusTone(status)) {
    case "positive":
      return "bg-[hsl(var(--chart-3))]";
    case "warning":
      return "bg-destructive";
    case "neutral":
      return "bg-muted-foreground";
    case "active":
    default:
      return "bg-accent";
  }
}
