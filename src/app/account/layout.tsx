import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountSidebar from "@/components/account/AccountSidebar";
import { prisma } from "@/lib/prisma";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  // Fetch latest avatar from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true }
  });

  const sidebarUser = {
    ...session.user,
    avatar: dbUser?.avatar || null
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pt-8 pb-16">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary-500/10 to-transparent dark:from-primary-900/20 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          
          {/* Client-side Sidebar for Active States & Premium UI */}
          <AccountSidebar user={sidebarUser} />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
