import type { TeamsAlert } from "./parse-alert";

export type Conversation = {
  id: string;
  cid: string;
  senderName: string;
  senderEmail: string;
  messages: TeamsAlert[];
  lastMessageAt: string;
  preview: string;
};

export function conversationKey(alert: TeamsAlert): string {
  const cid = alert.cid.trim();
  if (cid) return cid;
  return `no-cid-${alert.mid}`;
}

export function groupAlertsByCid(alerts: TeamsAlert[]): Conversation[] {
  const map = new Map<string, Conversation>();

  for (const alert of alerts) {
    const key = conversationKey(alert);
    const existing = map.get(key);

    if (existing) {
      existing.messages.push(alert);
      if (alert.receivedAt > existing.lastMessageAt) {
        existing.lastMessageAt = alert.receivedAt;
        existing.preview = alert.message;
      }
      if (alert.direction === "incoming") {
        if (alert.senderName.trim()) {
          existing.senderName = alert.senderName;
        }
        if (alert.senderEmail) {
          existing.senderEmail = alert.senderEmail;
        }
      }
    } else {
      map.set(key, {
        id: key,
        cid: alert.cid,
        senderName:
          alert.direction === "incoming" ? alert.senderName : "Unknown",
        senderEmail:
          alert.direction === "incoming" ? alert.senderEmail : "",
        messages: [alert],
        lastMessageAt: alert.receivedAt,
        preview: alert.message,
      });
    }
  }

  for (const conv of map.values()) {
    conv.messages.sort(
      (a, b) =>
        new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
    );
    conv.senderName = conversationTitle(conv);
  }

  return [...map.values()].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

function conversationTitle(conversation: Conversation): string {
  const uniqueIncoming = new Set<string>();
  const excludedNames = new Set(["you", "roman, catalin"]);

  for (const message of conversation.messages) {
    if (message.direction !== "incoming") continue;

    const name = message.senderName.trim();
    if (!name) continue;
    if (excludedNames.has(name.toLowerCase())) continue;

    uniqueIncoming.add(name);
  }

  const names = [...uniqueIncoming];
  if (names.length === 0) return conversation.senderName || "Unknown";
  if (names.length <= 2) return names.join(", ");
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

export function latestIncomingMessage(
  conversation: Conversation
): TeamsAlert | null {
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    if (conversation.messages[i].direction === "incoming") {
      return conversation.messages[i];
    }
  }
  return null;
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function initials(name: string): string {
  const parts = name.split(/[,\s]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
