"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker, isAppInstalled } from "@/lib/pwa";

export default function PWAInit() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();

    // Check if already installed
    setIsInstalled(isAppInstalled());

    // Listen for install availability
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setIsInstalled(true);
      console.log("PWA app installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Listen for service worker updates
    const handleSWUpdate = () => {
      console.log("Service Worker update available");
      // Could show a toast/notification here
    };

    window.addEventListener("sw-update-available", handleSWUpdate);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("sw-update-available", handleSWUpdate);
    };
  }, []);

  // Note: Install prompt UI not shown by default
  // Apps can integrate this component's state to show custom install prompts
  // For now, we rely on browser's native install prompt

  return null; // Component doesn't render anything, just initializes PWA
}
