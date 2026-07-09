import { decodeQuotedPrintable } from "./email-encoding";

export type MessageDirection = "incoming" | "outgoing";

export type TeamsAlert = {
  mid: string;
  senderName: string;
  message: string;
  senderEmail: string;
  cid: string;
  direction: MessageDirection;
  receivedAt: string;
};

const QUOTED = /"([^"]+)"/;

export function isIgnorableAlertBody(body: string): boolean {
  const normalizedBody = decodeQuotedPrintable(body);
  const fromMatch = normalizedBody.match(/From:\s*"([^"]*)"/i);
  return fromMatch !== null && fromMatch[1] === "";
}

export function parseAlertBody(
  body: string,
  fromHeader: string,
  replyToHeader?: string,
  fallbackTime?: string
): Pick<
  TeamsAlert,
  "senderName" | "message" | "senderEmail" | "cid" | "mid" | "receivedAt"
> {
  const normalizedBody = decodeQuotedPrintable(body);
  const fromMatch = normalizedBody.match(/From:\s*"([^"]*)"/i);
  const messageMatch = normalizedBody.match(/Message:\s*"([^"]+)"/i);
  const cidMatch = normalizedBody.match(/CID:\s*"([^"]+)"/i);
  const midMatch = normalizedBody.match(/MID:\s*"([^"]+)"/i);
  const timeMatch = normalizedBody.match(/Time:\s*"([^"]+)"/i);

  const senderName =
    fromMatch !== null
      ? fromMatch[1]
      : (fromHeader.match(QUOTED)?.[1] ??
        fromHeader.replace(/<[^>]+>/, "").trim() ||
        "Unknown");

  const message = messageMatch?.[1] ?? "";
  const cid = cidMatch?.[1] ?? "";
  const mid = midMatch?.[1] ?? "";
  const receivedAt = parseMessageTime(timeMatch?.[1], fallbackTime);

  const emailFromReplyTo = extractEmail(replyToHeader ?? "");
  const emailFromFrom = extractEmail(fromHeader);
  const senderEmail = emailFromReplyTo || emailFromFrom || "";

  return { senderName, message, senderEmail, cid, mid, receivedAt };
}

export function parseMessageTime(
  value: string | undefined,
  fallback?: string
): string {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  if (fallback) {
    const parsed = new Date(fallback);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

function extractEmail(header: string): string {
  const match = header.match(
    /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/
  );
  return match?.[1] ?? "";
}

export function buildReplyBody(cid: string, message: string): string {
  const time = new Date().toISOString();
  return `CID: "${cid}"\n\nMessage: "${message}"\n\nTime: "${time}"`;
}

export function generateOutgoingMid(): string {
  return String(Date.now());
}
