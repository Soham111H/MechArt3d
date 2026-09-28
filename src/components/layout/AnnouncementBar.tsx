// src/components/layout/AnnouncementBar.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSettingsStore, defaultSettings } from "@/store/useSettingsStore";

export default function AnnouncementBar() {
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user already dismissed this announcement in this session
    const key = `announcement-dismissed-${settings.announcementBar}`;
    if (sessionStorage.getItem(key)) {
      setDismissed(true);
    }
  }, [settings.announcementBar]);

  const handleDismiss = () => {
    setDismissed(true);
    const key = `announcement-dismissed-${settings.announcementBar}`;
    sessionStorage.setItem(key, "1");
  };

  const s = mounted ? settings : defaultSettings;

  if (!s.announcementBarEnabled || !s.announcementBar || dismissed) return null;

  return (
    <div className={`${s.announcementBarColor} text-white text-center py-2.5 px-4 relative z-50`}>
      <p className="text-sm font-semibold pr-8">{s.announcementBar}</p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
