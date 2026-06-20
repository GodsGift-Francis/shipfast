import { logger } from "../logger";

export interface SendResult {
  ok: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface SmsPayload {
  to: string;
  body: string;
}

const EMAIL_FROM = process.env.NOTIFY_EMAIL_FROM ?? "ShipFast <notifications@shipfast.app>";

// ---- Email (Resend HTTP API) ----------------------------------------------

export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!payload.to) {
    return { ok: false, provider: "none", skipped: true, error: "missing recipient" };
  }

  if (!apiKey) {
    // No provider configured — log and treat as a successful no-op so the
    // status pipeline keeps working in dev / unconfigured environments.
    logger.info({ to: payload.to, subject: payload.subject }, "[notify:email:console] would send email");
    return { ok: true, provider: "console", skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const detail = await safeText(res);
      return { ok: false, provider: "resend", error: `HTTP ${res.status}: ${detail}` };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, provider: "resend", messageId: data.id };
  } catch (err) {
    return { ok: false, provider: "resend", error: errorMessage(err) };
  }
}

// ---- SMS (Twilio HTTP API) -------------------------------------------------

export async function sendSms(payload: SmsPayload): Promise<SendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!payload.to) {
    return { ok: false, provider: "none", skipped: true, error: "missing recipient" };
  }

  if (!sid || !token || !from) {
    logger.info({ to: payload.to }, "[notify:sms:console] would send sms");
    return { ok: true, provider: "console", skipped: true };
  }

  try {
    const body = new URLSearchParams({ To: payload.to, From: from, Body: payload.body });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await safeText(res);
      return { ok: false, provider: "twilio", error: `HTTP ${res.status}: ${detail}` };
    }

    const data = (await res.json().catch(() => ({}))) as { sid?: string };
    return { ok: true, provider: "twilio", messageId: data.sid };
  } catch (err) {
    return { ok: false, provider: "twilio", error: errorMessage(err) };
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "<no body>";
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
