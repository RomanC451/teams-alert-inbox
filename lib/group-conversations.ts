import type { TeamsAlert } from "./parse-alert";

export type Conversation = {
  id: string;
  cid: string;
  senderName: string;
  displayName: string;
  chatName: string;
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

export function isNotificationAlert(alert: TeamsAlert): boolean {
  return (
    alert.direction === "incoming" &&
    !alert.message.trim() &&
    alert.senderName.trim() !== ""
  );
}

export type AlertNotification = {
  mid: string;
  cid: string;
  senderName: string;
  senderEmail: string;
  chat: string;
  receivedAt: string;
};

export function collectNotifications(alerts: TeamsAlert[]): AlertNotification[] {
  return alerts
    .filter(isNotificationAlert)
    .map((alert) => ({
      mid: alert.mid,
      cid: alert.cid,
      senderName: alert.senderName.trim(),
      senderEmail: alert.senderEmail,
      chat: alert.chat.trim(),
      receivedAt: alert.receivedAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
}

export function groupAlertsByCid(alerts: TeamsAlert[]): Conversation[] {
  const map = new Map<string, Conversation>();

  for (const alert of alerts) {
    if (isNotificationAlert(alert)) continue;

    const key = conversationKey(alert);
    const existing = map.get(key);

    if (existing) {
      existing.messages.push(alert);
      if (alert.receivedAt > existing.lastMessageAt) {
        existing.lastMessageAt = alert.receivedAt;
        if (alert.message.trim()) {
          existing.preview = alert.message;
        }
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
        displayName:
          alert.direction === "incoming" ? alert.senderName : "Unknown",
        chatName: alert.chat,
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
    conv.chatName = findChatName(conv);
    conv.displayName = conv.chatName || conv.senderName;
  }

  return [...map.values()].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

function findChatName(conversation: Conversation): string {
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    const message = conversation.messages[i];
    if (message.direction !== "incoming") continue;
    const chat = message.chat.trim();
    if (chat) return chat;
  }
  return "";
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
