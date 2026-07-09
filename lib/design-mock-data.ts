import type { Conversation } from "./group-conversations";

export const mockConversations: Conversation[] = [
  {
    id: "cid-1",
    cid: "19:abc@spaces",
    senderName: "Alex Morgan",
    senderEmail: "alex@company.com",
    lastMessageAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    preview: "Server room temp hit 31°C again",
    messages: [
      {
        mid: "1",
        cid: "19:abc@spaces",
        direction: "incoming",
        senderName: "Alex Morgan",
        senderEmail: "alex@company.com",
        message: "Server room temp hit 31°C again",
        receivedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
      },
      {
        mid: "2",
        cid: "19:abc@spaces",
        direction: "outgoing",
        senderName: "You",
        senderEmail: "me@gmail.com",
        message: "On my way with the fan army",
        receivedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
      },
      {
        mid: "3",
        cid: "19:abc@spaces",
        direction: "incoming",
        senderName: "Alex Morgan",
        senderEmail: "alex@company.com",
        message: "HVAC team says ETA 20 min",
        receivedAt: new Date(Date.now() - 3 * 60_000).toISOString(),
      },
    ],
  },
  {
    id: "cid-2",
    cid: "19:def@spaces",
    senderName: "Priya Shah, DevOps",
    senderEmail: "priya@company.com",
    lastMessageAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    preview: "Deploy failed on staging — rollback?",
    messages: [
      {
        mid: "4",
        cid: "19:def@spaces",
        direction: "incoming",
        senderName: "Priya Shah",
        senderEmail: "priya@company.com",
        message: "Deploy failed on staging — rollback?",
        receivedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
      },
    ],
  },
  {
    id: "cid-3",
    cid: "19:ghi@spaces",
    senderName: "Night Shift",
    senderEmail: "night@company.com",
    lastMessageAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    preview: "All quiet. Coffee machine survived.",
    messages: [
      {
        mid: "5",
        cid: "19:ghi@spaces",
        direction: "incoming",
        senderName: "Night Shift",
        senderEmail: "night@company.com",
        message: "All quiet. Coffee machine survived.",
        receivedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      },
    ],
  },
];

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
