"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function SettingsProvider() {
  const { setSettings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fetch global settings from database on mount
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const dbSettings = await res.json();
          // Filter out empty db response if the database is completely empty
          if (Object.keys(dbSettings).length > 0) {
            setSettings(dbSettings);
          }
        }
      } catch (error) {
        console.error("Failed to sync settings from database:", error);
      }
    };

    fetchSettings();
  }, [setSettings]);

  // This is a silent provider, it doesn't render anything visually
  return null;
}
