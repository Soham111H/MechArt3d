// src/app/not-found.tsx
import Link from "next/link";
import { Box, ArrowLeft, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-black leading-none text-slate-100 dark:text-slate-800 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl flex items-center justify-center shadow-glow animate-float">
              <Box size={44} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg">
              <ArrowLeft size={16} /> Go Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary" size="lg">
              <Search size={16} /> Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
