"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { TeamsAlert } from "./parse-alert";

type InboxContextValue = {
  alerts: TeamsAlert[];
  loading: boolean;
  refreshing: boolean;
  initialized: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  toast: string | null;
  setToast: (toast: string | null) => void;
  needsAuth: boolean;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  refreshInbox: () => Promise<void>;
  upsertAlert: (alert: TeamsAlert) => void;
  removeConversation: (cid: string) => void;
};

const InboxContext = createContext<InboxContextValue | null>(null);

async function fetchAlerts(sync: boolean): Promise<{
  alerts: TeamsAlert[];
  unauthorized: boolean;
  error?: string;
}> {
  const url = sync ? "/api/alerts?sync=1" : "/api/alerts";
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 401) {
    return { alerts: [], unauthorized: true };
  }
  const data = await res.json();
  if (!res.ok) {
    return {
      alerts: [],
      unauthorized: false,
      error: data.error ?? "Failed to load",
    };
  }
  return { alerts: data.alerts, unauthorized: false };
}

const POLL_INTERVAL_MS = 5000;

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<TeamsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const bootstrapped = useRef(false);
  const polling = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    initializedRef.current = initialized;
  }, [initialized]);

  const loadAlerts = useCallback(async (sync: boolean, options?: { background?: boolean }) => {
    const background = options?.background ?? false;

    if (sync && background) {
      if (polling.current) return;
      polling.current = true;
    } else if (sync && !initializedRef.current) {
      setLoading(true);
    } else if (sync) {
      setRefreshing(true);
    } else if (!initializedRef.current) {
      setLoading(true);
    }

    if (!background) {
      setError(null);
    }

    try {
      const result = await fetchAlerts(sync);
      if (result.unauthorized) {
        setNeedsAuth(true);
        return;
      }
      if (result.error) {
        throw new Error(result.error);
      }
      setAlerts(result.alerts);
      setNeedsAuth(false);
      setInitialized(true);
    } catch (e) {
      if (!background) {
        setError(e instanceof Error ? e.message : "Failed to load alerts");
      }
    } finally {
      if (sync && background) {
        polling.current = false;
      } else {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void loadAlerts(true);
  }, [loadAlerts]);

  useEffect(() => {
    function tick() {
      if (document.visibilityState !== "visible") return;
      if (needsAuth || !initializedRef.current) return;
      void loadAlerts(true, { background: true });
    }

    const intervalId = window.setInterval(tick, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        tick();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadAlerts, needsAuth]);

  const refreshInbox = useCallback(async () => {
    await loadAlerts(true);
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
    await loadAlerts(true);
  }

  function upsertAlert(alert: TeamsAlert) {
    setAlerts((current) => {
      const index = current.findIndex((item) => item.mid === alert.mid);
      if (index === -1) return [...current, alert];
      const next = [...current];
      next[index] = alert;
      return next;
    });
  }

  function removeConversation(cid: string) {
    setAlerts((current) => current.filter((alert) => alert.cid !== cid));
  }

  return (
    <InboxContext.Provider
      value={{
        alerts,
        loading,
        refreshing,
        initialized,
        error,
        setError,
        toast,
        setToast,
        needsAuth,
        password,
        setPassword,
        handleLogin,
        refreshInbox,
        upsertAlert,
        removeConversation,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error("useInbox must be used within InboxProvider");
  }
  return context;
}
