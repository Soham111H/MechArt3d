"use client";

import { usePathname } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";
import Button from "@/components/ui/Button";

interface SystemGuardProviderProps {
  children: React.ReactNode;
  maintenanceMode: boolean;
  disabledRoutes: string[];
  isSuperAdmin: boolean;
}

export default function SystemGuardProvider({
  children,
  maintenanceMode,
  disabledRoutes,
  isSuperAdmin,
}: SystemGuardProviderProps) {
  const pathname = usePathname();

  // If maintenance mode is ON and user is NOT Super Admin
  if (maintenanceMode && !isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-6">
          <Lock size={48} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          Under Maintenance
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          We are currently performing scheduled maintenance to improve our systems. 
          Please check back shortly. We apologize for the inconvenience.
        </p>
      </div>
    );
  }

  // If the current route is disabled and user is NOT Super Admin
  const isRouteDisabled = disabledRoutes.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );

  if (isRouteDisabled && !isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mb-6">
          <AlertTriangle size={48} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
          Page Temporarily Unavailable
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          This specific page has been temporarily disabled by our administrators. 
          Please try again later.
        </p>
        <Button variant="primary" onClick={() => window.location.href = "/"}>
          Return Home
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
