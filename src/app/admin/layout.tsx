import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Panel | MechArt 3D",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  // Role guard — only SUPER_ADMIN, STAFF, and legacy ADMIN allowed
  const role = session?.user?.role;
  if (!session || (role !== "SUPER_ADMIN" && role !== "STAFF" && role !== "ADMIN")) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return (
    <AdminShell user={session.user}>
      {children}
    </AdminShell>
  );
}
