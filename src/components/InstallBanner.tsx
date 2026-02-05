"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function CloseIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(isIOSDevice);

    // Check if already dismissed
    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt) {
      // Check if it was dismissed recently (within 7 days)
      const dismissedDate = new Date(dismissedAt).getTime();
      const now = new Date().getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      if (now - dismissedDate < sevenDaysMs) {
        return; // Don't show banner if dismissed recently
      }
    }

    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    // Hide banner if app is installed
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error("Install prompt error:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  // Show iOS hint instead of banner
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-50 dark:bg-blue-950 border-t border-blue-200 dark:border-blue-800 px-4 py-3 flex items-center justify-between gap-3 z-40 text-sm">
        <p className="text-blue-900 dark:text-blue-100 flex-1">
          💡 Tap <span className="font-semibold">Share</span> then{" "}
          <span className="font-semibold">Add to Home Screen</span>
        </p>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <CloseIcon size={18} className="text-blue-900 dark:text-blue-100" />
        </button>
      </div>
    );
  }

  // Show install banner only on non-iOS with beforeinstallprompt support
  if (!showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 px-4 py-3 flex items-center justify-between gap-3 z-40 shadow-lg">
      <div className="flex-1">
        <p className="text-white text-sm font-medium">Install app for instant access</p>
        <p className="text-blue-100 text-xs">Works offline • Added to your home screen</p>
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={handleInstall}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-blue-400 dark:hover:bg-blue-600 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <CloseIcon size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}
