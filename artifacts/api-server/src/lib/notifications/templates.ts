import type { Shipment } from "@workspace/db";

export type ShipmentStatusKey =
  | "pending"
  | "processing"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "on_hold";

export interface StatusCopy {
  label: string;
  headline: string;
  body: string;
}

const STATUS_COPY: Record<ShipmentStatusKey, StatusCopy> = {
  pending: {
    label: "Booked",
    headline: "Your shipment is booked",
    body: "We have received your shipment details and it is awaiting pickup.",
  },
  processing: {
    label: "Processing",
    headline: "Your shipment is being processed",
    body: "Your package has been picked up and is being prepared at our facility.",
  },
  in_transit: {
    label: "In Transit",
    headline: "Your shipment is on the way",
    body: "Your package is moving through our network toward its destination.",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    headline: "Your shipment is out for delivery",
    body: "Your package is with a courier and will arrive today.",
  },
  delivered: {
    label: "Delivered",
    headline: "Your shipment has been delivered",
    body: "Your package has arrived at its destination. Thank you for choosing ShipFast.",
  },
  cancelled: {
    label: "Cancelled",
    headline: "Your shipment was cancelled",
    body: "This shipment has been cancelled. Contact support if this is unexpected.",
  },
  on_hold: {
    label: "On Hold",
    headline: "Your shipment is on hold",
    body: "Your package is temporarily on hold. We will resume movement shortly.",
  },
};

export function getStatusCopy(status: string): StatusCopy {
  return (
    STATUS_COPY[status as ShipmentStatusKey] ?? {
      label: status,
      headline: "Shipment update",
      body: "There is an update on your shipment.",
    }
  );
}

export interface RenderedMessage {
  subject: string;
  text: string;
  html: string;
  sms: string;
}

export interface RenderContext {
  shipment: Pick<Shipment, "trackingNumber" | "destinationCity" | "destinationCountry">;
  status: string;
  location: string;
  description: string;
  recipientName: string;
  trackingUrl: string;
}

export function renderStatusMessage(ctx: RenderContext): RenderedMessage {
  const copy = getStatusCopy(ctx.status);
  const tn = ctx.shipment.trackingNumber;

  const subject = `ShipFast • ${copy.label} — ${tn}`;

  const text = [
    `Hi ${ctx.recipientName},`,
    "",
    copy.headline + ".",
    copy.body,
    "",
    `Tracking number: ${tn}`,
    `Current status: ${copy.label}`,
    ctx.location ? `Location: ${ctx.location}` : "",
    ctx.description ? `Update: ${ctx.description}` : "",
    "",
    `Track your package: ${ctx.trackingUrl}`,
    "",
    "— The ShipFast Team",
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderHtml(ctx, copy);

  const sms = `ShipFast: ${tn} is now ${copy.label}.${
    ctx.location ? ` At ${ctx.location}.` : ""
  } Track: ${ctx.trackingUrl}`;

  return { subject, text, html, sms };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(ctx: RenderContext, copy: StatusCopy): string {
  const tn = escapeHtml(ctx.shipment.trackingNumber);
  const dest = escapeHtml(
    [ctx.shipment.destinationCity, ctx.shipment.destinationCountry].filter(Boolean).join(", "),
  );
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
          <tr><td style="background:#0b1f3a;padding:28px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">Ship<span style="color:#f59e0b;">Fast</span></span>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#f59e0b;font-weight:700;">${escapeHtml(copy.label)}</p>
            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${escapeHtml(copy.headline)}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">Hi ${escapeHtml(ctx.recipientName)}, ${escapeHtml(copy.body)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
              <tr><td style="padding:16px 20px;font-size:14px;color:#475569;">
                <strong style="color:#0f172a;">Tracking</strong>: ${tn}<br/>
                <strong style="color:#0f172a;">Status</strong>: ${escapeHtml(copy.label)}<br/>
                ${ctx.location ? `<strong style="color:#0f172a;">Location</strong>: ${escapeHtml(ctx.location)}<br/>` : ""}
                ${dest ? `<strong style="color:#0f172a;">Destination</strong>: ${dest}` : ""}
              </td></tr>
            </table>
            <div style="text-align:center;padding:28px 0 8px;">
              <a href="${escapeHtml(ctx.trackingUrl)}" style="display:inline-block;background:#f59e0b;color:#0b1f3a;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:15px;">Track your package</a>
            </div>
          </td></tr>
          <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
            You are receiving this because a shipment update was triggered on ShipFast.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
