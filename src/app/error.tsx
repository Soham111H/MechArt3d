// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
    // Silently log to database
    fetch("/api/system/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Unknown error",
        stackTrace: error.stack || null,
        path: typeof window !== "undefined" ? window.location.pathname : null,
      }),
    }).catch(() => {}); // Ignore network errors in error boundary
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
          An unexpected error occurred. Our team has been notified. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono mb-8">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" size="lg" onClick={reset}>
            <RefreshCw size={16} /> Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg">
              <ArrowLeft size={16} /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
