import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ShoppingCart, Users, Package, TrendingUp,
  Clock, AlertTriangle, CheckCircle, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  try {
    const now = new Date();
    const todayStart    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart     = new Date(now.getFullYear(), 0, 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevYearStart  = new Date(now.getFullYear() - 1, 0, 1);
    const prevYearEnd    = new Date(now.getFullYear() - 1, 11, 31);

    const paidFilter = { paymentStatus: 'PAID' as const };

    const [
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      lowStockCount,
      revenueAll,
      revenueToday,
      revenueMonth,
      revenueYear,
      revenuePrevMonth,
      revenuePrevYear,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: paidFilter }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...paidFilter, createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...paidFilter, createdAt: { gte: monthStart } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...paidFilter, createdAt: { gte: yearStart } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...paidFilter, createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...paidFilter, createdAt: { gte: prevYearStart, lte: prevYearEnd } } }),
    ]);

    const fmtRevenue = (v: any) => Number(v?._sum?.total ?? 0);
    const pctChange  = (cur: number, prev: number) => prev === 0 ? null : Math.round(((cur - prev) / prev) * 100);

    const rm  = fmtRevenue(revenueMonth);
    const rpm = fmtRevenue(revenuePrevMonth);
    const ry  = fmtRevenue(revenueYear);
    const rpy = fmtRevenue(revenuePrevYear);

    return {
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      lowStockCount,
      totalRevenue:   fmtRevenue(revenueAll),
      todayRevenue:   fmtRevenue(revenueToday),
      monthRevenue:   rm,
      yearRevenue:    ry,
      monthChangePct: pctChange(rm, rpm),
      yearChangePct:  pctChange(ry, rpy),
    };
  } catch {
    return {
      totalOrders: 0, totalUsers: 0, totalProducts: 0, pendingOrders: 0, lowStockCount: 0,
      totalRevenue: 0, todayRevenue: 0, monthRevenue: 0, yearRevenue: 0,
      monthChangePct: null, yearChangePct: null,
    };
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const stats   = await getStats();

  const statCards = [
    {
      label: "Total Orders",    value: stats.totalOrders.toString(),
      icon: ShoppingCart,       color: "text-blue-500",    bg: "bg-blue-500/10",
      href: "/admin/orders",    change: "+12% this week",
    },
    {
      label: "Customers",       value: stats.totalUsers.toString(),
      icon: Users,              color: "text-green-500",   bg: "bg-green-500/10",
      href: "/admin/users",     change: "+5 today",
    },
    {
      label: "Active Products", value: stats.totalProducts.toString(),
      icon: Package,            color: "text-purple-500",  bg: "bg-purple-500/10",
      href: "/admin/products",  change: "Across all categories",
    },
    {
      label: 'Revenue This Month',
      value: `₹${stats.monthRevenue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'text-primary-500',
      bg: 'bg-primary-500/10',
      href: '/admin/analytics',
      change: stats.monthChangePct !== null
        ? `${stats.monthChangePct >= 0 ? '+' : ''}${stats.monthChangePct}% vs last month`
        : 'No previous data',
    },
  ];

  const alerts = [
    stats.pendingOrders > 0 && {
      icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50",
      title: `${stats.pendingOrders} orders awaiting confirmation`,
      href: "/admin/orders?status=PENDING",
    },
    stats.lowStockCount > 0 && {
      icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50",
      title: `${stats.lowStockCount} products are running low on stock`,
      href: "/admin/products?filter=low-stock",
    },
  ].filter(Boolean) as any[];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{session?.user?.name}</span>. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <Link key={i} href={alert.href} className={`flex items-center gap-3 p-4 rounded-2xl border ${alert.bg} transition-opacity hover:opacity-90`}>
                <Icon size={18} className={alert.color} />
                <span className={`text-sm font-semibold ${alert.color}`}>{alert.title}</span>
                <ArrowUpRight size={16} className={`ml-auto ${alert.color}`} />
              </Link>
            );
          })}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="group">
              <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:border-primary-300 dark:hover:border-primary-700/50 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{card.change}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`,  sub: 'Paid orders only' },
          { label: 'This Month',      value: `₹${stats.monthRevenue.toLocaleString('en-IN')}`,  sub: stats.monthChangePct !== null ? `${stats.monthChangePct >= 0 ? '+' : ''}${stats.monthChangePct}% vs last month` : '' },
          { label: 'This Year',       value: `₹${stats.yearRevenue.toLocaleString('en-IN')}`,   sub: stats.yearChangePct  !== null ? `${stats.yearChangePct  >= 0 ? '+' : ''}${stats.yearChangePct}% vs last year`  : '' },
        ].map(r => (
          <div key={r.label} className="card p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{r.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{r.value}</p>
            {r.sub && <p className="text-xs text-slate-400 mt-1">{r.sub}</p>}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <CheckCircle size={20} className="text-primary-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Product",    href: "/admin/products/new",  color: "bg-primary-600 hover:bg-primary-700 text-white" },
            { label: "View Orders",    href: "/admin/orders",        color: "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white" },
            { label: "Add Coupon",     href: "/admin/coupons/new",   color: "bg-green-600 hover:bg-green-700 text-white" },
            { label: "Manage Staff",   href: "/admin/staff",         color: "bg-purple-600 hover:bg-purple-700 text-white" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-colors ${action.color}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">System Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Database",   status: "Online",  ok: true },
            { label: "Cloudinary", status: "Not configured", ok: false },
            { label: "Razorpay",   status: "Not configured", ok: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.ok ? "bg-green-500" : "bg-yellow-500"}`} />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.label}</p>
                <p className={`text-xs font-medium ${s.ok ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                  {s.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
