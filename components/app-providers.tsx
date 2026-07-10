"use client";

import { InboxProvider } from "@/lib/inbox-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <InboxProvider>{children}</InboxProvider>;
}
