import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { Toaster } from "react-hot-toast";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import ProgressBarProvider from "@/components/providers/ProgressBarProvider";
import PageTransitionProvider from "@/components/providers/PageTransitionProvider";
import SettingsProvider from "@/components/providers/SettingsProvider";
import SystemGuardProvider from "@/components/providers/SystemGuardProvider";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MechArt 3D — Premium 3D Printing & Custom Design",
    template: "%s | MechArt 3D",
  },
  description:
    "Where Fundamental binds with the Artistic and brings the product to exist. Shop premium 3D printed products, order custom designs, and explore 3D printing services.",
  keywords: ["3D printing", "custom design", "3D models", "PLA", "resin", "MechArt"],
  authors: [{ name: "MechArt 3D" }],
  creator: "MechArt 3D",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "MechArt 3D",
    title: "MechArt 3D — Premium 3D Printing & Custom Design",
    description: "Premium 3D printed products, custom design services, and engineering solutions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MechArt 3D",
    description: "Premium 3D Printing & Custom Design",
  },
  robots: { index: true, follow: true },
};

import { unstable_cache } from "next/cache";

const getSystemSettings = unstable_cache(
  async () => {
    let maintenanceMode = false;
    let disabledRoutes: string[] = [];
    try {
      const settings = await prisma.setting.findMany({
        where: { key: { in: ["MAINTENANCE_MODE", "DISABLED_ROUTES"] } },
      });
      settings.forEach((s) => {
        if (s.key === "MAINTENANCE_MODE") maintenanceMode = s.value === "true";
        if (s.key === "DISABLED_ROUTES") {
          try { disabledRoutes = JSON.parse(s.value); } catch (e) {}
        }
      });
    } catch (err) {}
    return { maintenanceMode, disabledRoutes };
  },
  ["global-system-settings"],
  { revalidate: 30 } // Cache for 30 seconds for massive performance boost
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch system operations configuration from highly optimized cache
  const { maintenanceMode, disabledRoutes } = await getSystemSettings();

  // ONLY check auth if we actually need to evaluate a bypass (saves database hits on normal page loads)
  let isSuperAdmin = false;
  if (maintenanceMode || disabledRoutes.length > 0) {
    const session = await auth();
    isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  }

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head />
      <body className="min-h-screen flex flex-col antialiased font-sans">
        {/* Dark mode init script — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const s = localStorage.getItem('mechart-ui');
                if (s && JSON.parse(s).state?.isDarkMode) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />

        <NextAuthProvider>
          <SettingsProvider />
          <ProgressBarProvider />
          <AnnouncementBar />
          <Navbar />
          <MobileMenu />

          <main className="flex-1 pt-16">
            <PageTransitionProvider>
              <SystemGuardProvider 
                maintenanceMode={maintenanceMode} 
                disabledRoutes={disabledRoutes} 
                isSuperAdmin={isSuperAdmin}
              >
                {children}
              </SystemGuardProvider>
            </PageTransitionProvider>
          </main>

          <Footer />
          <WhatsAppButton />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "12px",
                background: "var(--card-bg)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                fontSize: "14px",
                fontFamily: "var(--font-inter), sans-serif",
              },
            }}
          />
        </NextAuthProvider>
      </body>
    </html>
  );
}
