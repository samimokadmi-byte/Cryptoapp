"use client";
import { useState, useCallback, useEffect } from "react";

export type NotifPermission = NotificationPermission | "unsupported";

export function useNotifications() {
  const [permission, setPermission] = useState<NotifPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPermission(p);
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    // Desktop: direct constructor
    try {
      new Notification(title, { body });
      return;
    } catch {
      // Mobile Chrome requires Service Worker — fall through
    }

    // Mobile fallback: service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then(reg => reg.showNotification(title, { body }))
        .catch(() => { /* SW not available, skip silently */ });
    }
  }, []);

  return { permission, requestPermission, notify };
}
