import { auth } from "@/lib/auth";
import { Package, Star, Gift, ChevronRight, Clock, Box } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AccountOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // We wrap database calls in try/catch to avoid hard crashing if DB isn't reachable
  let ordersCount = 0;
  let wishlistCount = 0;
  let points = 0;

  try {
    const [orders, wishlist, pointsData] = await Promise.all([
      prisma.order.count({ where: { userId: session.user.id } }),
      prisma.wishlist.count({ where: { userId: session.user.id } }),
      prisma.rewardPoint.aggregate({
        where: { userId: session.user.id },
        _sum: { points: true }
      }),
    ]);
    ordersCount = orders;
    wishlistCount = wishlist;
    points = pointsData._sum.points || 0;
  } catch (error) {
    console.error("Database connection failed:", error);
  }

  const stats = [
    { label: "Total Orders", value: ordersCount.toString(), icon: Package, href: "/account/orders", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Wishlist Items", value: wishlistCount.toString(), icon: Star, href: "/wishlist", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Reward Points", value: points.toString(), icon: Gift, href: "/account/rewards", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up gpu">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-[#0a0f1e] shadow-2xl group border border-slate-800">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-primary-500 to-purple-600 opacity-20 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-30 gpu" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-gradient-to-tr from-blue-500 to-teal-400 opacity-10 blur-2xl rounded-full transition-opacity duration-500 group-hover:opacity-20 gpu" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              Welcome back, {session.user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-400 flex items-center gap-2 font-medium">
              <Clock size={16} className="text-slate-500" /> Secure Session • Logged in today
            </p>
          </div>
          <Link href="/products" className="btn-primary shrink-0 shadow-lg shadow-primary-500/20 ring-1 ring-primary-500/50 hover:shadow-primary-500/40">
            Start Shopping
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group block gpu">
              <div className={`card p-6 border ${stat.border} hover:border-primary-500/40 shadow-sm hover:shadow-card-hover bg-white dark:bg-slate-900 transition-colors duration-200 ease-out`}>
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 gpu`}>
                    <Icon size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{stat.value}</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out gpu">
                  <ChevronRight size={20} className="text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="card overflow-hidden gpu">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package size={18} className="text-primary-600 dark:text-primary-400" />
            Recent Activity
          </h2>
          <Link href="/account/orders" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline transition-colors duration-200">
            View All Orders
          </Link>
        </div>
        
        <div className="p-8 md:p-12">
          {ordersCount === 0 ? (
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-slate-200 dark:ring-slate-700">
                <Box size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">No orders placed yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                You haven't placed any orders with MechArt 3D yet. Explore our catalog or request a custom design to get started!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/products" className="btn-primary w-full sm:w-auto text-sm">
                  Browse Catalog
                </Link>
                <Link href="/custom-design" className="btn-outline w-full sm:w-auto text-sm">
                  Custom Request
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-500 text-center text-sm py-10">
                Order history list will appear here...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
