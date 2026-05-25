"use client";
import { formatDistanceToNow } from "date-fns";
import type { NotifPermission } from "@/hooks/useNotifications";

interface HeaderProps {
  lastFetch: Date | null;
  loading: boolean;
  onRefresh: () => void;
  notifPermission: NotifPermission;
  onEnableNotifications: () => void;
}

export default function Header({ lastFetch, loading, onRefresh, notifPermission, onEnableNotifications }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-1/90 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-2xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center">
            <svg className="h-4 w-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="font-mono text-sm font-semibold tracking-widest text-accent-cyan uppercase">
              CryptoTrend
            </h1>
            <p className="text-xs text-slate-500 font-mono">Multi-Timeframe Confluence Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastFetch && (
            <span className="text-xs text-slate-500 font-mono hidden sm:block">
              Updated {formatDistanceToNow(lastFetch, { addSuffix: true })}
            </span>
          )}

          {/* Notification bell */}
          {notifPermission !== "unsupported" && (
            <button
              onClick={onEnableNotifications}
              disabled={notifPermission === "denied"}
              title={
                notifPermission === "granted"
                  ? "Notifications actives"
                  : notifPermission === "denied"
                  ? "Notifications bloquées par le navigateur"
                  : "Activer les notifications"
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono
                transition-all ${
                  notifPermission === "granted"
                    ? "border-accent-green/40 text-accent-green bg-accent-green/10 cursor-default"
                    : notifPermission === "denied"
                    ? "border-border text-slate-600 cursor-not-allowed opacity-50"
                    : "border-border text-slate-400 bg-surface-2 hover:border-accent-amber/50 hover:text-accent-amber"
                }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="hidden sm:inline">
                {notifPermission === "granted" ? "Notifs ON" : notifPermission === "denied" ? "Bloqué" : "Notifs"}
              </span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-2
                       text-xs font-mono text-slate-300 hover:border-accent-cyan/50 hover:text-accent-cyan
                       transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Fetching…" : "Refresh"}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
            </span>
            <span className="text-xs font-mono text-accent-green hidden sm:block">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
