"use client";

import { useCallback, useEffect, useState } from "react";
import type { TeamsAlert } from "./parse-alert";

export function useInbox() {
  const [alerts, setAlerts] = useState<TeamsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [password, setPassword] = useState("");

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      if (res.status === 401) {
        setNeedsAuth(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setAlerts(data.alerts);
      setNeedsAuth(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password");
      return;
    }
    setNeedsAuth(false);
    setError(null);
    loadAlerts();
  }

  return {
    alerts,
    loading,
    error,
    setError,
    toast,
    setToast,
    needsAuth,
    password,
    setPassword,
    handleLogin,
    loadAlerts,
  };
}
