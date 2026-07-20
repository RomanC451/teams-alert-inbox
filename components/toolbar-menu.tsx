"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ToolbarMenuProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

export function ToolbarMenu({ refreshing, onRefresh }: ToolbarMenuProps) {
  const [open, setOpen] = useState(false);
  const [jigglerOn, setJigglerOn] = useState(false);
  const [jigglerReady, setJigglerReady] = useState(false);
  const [jigglerLoading, setJigglerLoading] = useState(false);
  const [jigglerError, setJigglerError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setJigglerReady(false);
    setJigglerError(null);
    setJigglerLoading(true);

    fetch("/api/ha/mouse-jiggler", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) {
          setJigglerOn(Boolean(data.on));
          setJigglerReady(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setJigglerReady(false);
          setJigglerError(
            error instanceof Error ? error.message : "Failed to load"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setJigglerLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  async function toggleJiggler() {
    if (!jigglerReady || jigglerLoading) return;

    const next = !jigglerOn;
    setJigglerLoading(true);
    setJigglerError(null);
    setJigglerOn(next);

    try {
      const res = await fetch("/api/ha/mouse-jiggler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      // Keep optimistic value if HA is still catching up.
      setJigglerOn(typeof data.on === "boolean" ? data.on : next);
    } catch (error) {
      setJigglerOn(!next);
      setJigglerError(
        error instanceof Error ? error.message : "Failed to update"
      );
    } finally {
      setJigglerLoading(false);
    }
  }

  return (
    <div className="toolbar-menu" ref={rootRef}>
      <button
        type="button"
        className={`toolbar-btn${open ? " is-active" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Menu"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Menu"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M5 7.5A1.5 1.5 0 0 1 6.5 6h11a1.5 1.5 0 1 1 0 3h-11A1.5 1.5 0 0 1 5 7.5Zm0 4.5A1.5 1.5 0 0 1 6.5 10.5h11a1.5 1.5 0 1 1 0 3h-11A1.5 1.5 0 0 1 5 12Zm0 4.5A1.5 1.5 0 0 1 6.5 15h11a1.5 1.5 0 1 1 0 3h-11A1.5 1.5 0 0 1 5 16.5Z"
          />
        </svg>
      </button>

      {open && (
        <div className="toolbar-menu-panel" role="menu">
          <div className="toolbar-menu-switch" role="menuitemcheckbox" aria-checked={jigglerOn}>
            <div className="toolbar-menu-switch-text">
              <span className="toolbar-menu-switch-label">Mouse jiggler</span>
              {jigglerError ? (
                <span className="toolbar-menu-switch-error">{jigglerError}</span>
              ) : (
                <span className="toolbar-menu-switch-sub">
                  {!jigglerReady
                    ? "Loading…"
                    : jigglerLoading
                      ? "Updating…"
                      : jigglerOn
                        ? "On"
                        : "Off"}
                </span>
              )}
            </div>
            <button
              type="button"
              className={`switch-toggle${jigglerOn ? " is-on" : ""}`}
              onClick={toggleJiggler}
              disabled={!jigglerReady || jigglerLoading}
              aria-label={`Turn mouse jiggler ${jigglerOn ? "off" : "on"}`}
            >
              <span className="switch-toggle-thumb" />
            </button>
          </div>

          <div className="toolbar-menu-divider" />

          <Link
            href="/home"
            className="toolbar-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3.2 3.5 10.4a.8.8 0 0 0-.3.6v8.2c0 .7.6 1.3 1.3 1.3H9.2a.8.8 0 0 0 .8-.8v-4.1c0-.4.3-.8.8-.8h2.4c.4 0 .8.4.8.8v4.1c0 .4.4.8.8.8h4.7c.7 0 1.3-.6 1.3-1.3v-8.2a.8.8 0 0 0-.3-.6L12 3.2Z"
              />
            </svg>
            <span>Home</span>
          </Link>
          <button
            type="button"
            className="toolbar-menu-item"
            role="menuitem"
            disabled={refreshing}
            onClick={() => {
              setOpen(false);
              onRefresh();
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              aria-hidden="true"
              className={refreshing ? "is-spinning" : undefined}
            >
              <path
                fill="currentColor"
                d="M12 4a8 8 0 0 1 7.1 4.3l1.4-1.4a1 1 0 0 1 1.7.7V12a1 1 0 0 1-1 1h-4.4a1 1 0 0 1-.7-1.7l1.5-1.5A6 6 0 1 0 18 12a1 1 0 1 1 2 0A8 8 0 1 1 12 4Z"
              />
            </svg>
            <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
