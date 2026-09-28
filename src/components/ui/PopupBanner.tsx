"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PopupBanner() {
  const { settings } = useSettingsStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!settings.popupEnabled) return;

    // Check session storage to see if we've already shown it this session
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, (settings.popupDelaySeconds || 0) * 1000);

    return () => clearTimeout(timer);
  }, [settings.popupEnabled, settings.popupDelaySeconds]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full text-slate-800 dark:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {settings.popupImage && (
              <div className="w-full sm:w-2/5 h-48 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-800 relative">
                <img 
                  src={settings.popupImage} 
                  alt={settings.popupTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8 sm:p-10 flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                {settings.popupTitle}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {settings.popupText}
              </p>
              
              {settings.popupLink && settings.popupLinkText && (
                <Link 
                  href={settings.popupLink}
                  onClick={handleClose}
                  className="inline-block text-center w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary-600/20"
                >
                  {settings.popupLinkText}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
