import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, Users, Eye, TrendingUp, IndianRupee, ShoppingBag } from "lucide-react";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import AnalyticsControls from "@/components/admin/AnalyticsControls";

export default async function AnalyticsPage({ searchParams }: { searchParams: { year?: string, month?: string } }) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  const now = new Date();
  let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  let endDate = now;
  let isCustom = false;

  if (searchParams.year) {
    const year = parseInt(searchParams.year);
    if (searchParams.month && searchParams.month !== "ALL") {
      const month = parseInt(searchParams.month);
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59); // end of month
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }
    isCustom = true;
  }

  // 1. Basic Stats
  const [totalVisits, totalOrders, totalUsers, totalRevenueAgg] = await Promise.all([
    prisma.pageVisit.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
    prisma.order.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: startDate, lte: endDate } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: endDate } }
    })
  ]);

  const totalRevenue = Number(totalRevenueAgg._sum.total || 0);

  // 2. Daily Revenue & Orders (in the given timeframe)
  const ordersInTimeframe = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    },
    select: { createdAt: true, total: true, paymentStatus: true }
  });

  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  
  if (isCustom) {
    // Fill all days between startDate and endDate
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dailyMap[dateStr] = { revenue: 0, orders: 0 };
    }
  } else {
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dailyMap[dateStr] = { revenue: 0, orders: 0 };
    }
  }

  ordersInTimeframe.forEach(o => {
    const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (dailyMap[dateStr]) {
      dailyMap[dateStr].orders += 1;
      if (o.paymentStatus === 'PAID') {
        dailyMap[dateStr].revenue += Number(o.total);
      }
    }
  });

  const dailyData = Object.entries(dailyMap).map(([date, data]) => ({ date, ...data }));

  // 3. Order Status Distribution
  const statuses = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true },
    where: { createdAt: { gte: startDate, lte: endDate } }
  });

  const statusData = statuses.map(s => ({
    status: s.status,
    count: s._count.status
  }));

  // 4. Top Selling Products
  const orderItems = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' } },
    include: { product: { select: { name: true } } }
  });

  const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};
  
  orderItems.forEach(item => {
    if (!item.product) return;
    const name = item.product.name;
    if (!productSales[name]) {
      productSales[name] = { name, sold: 0, revenue: 0 };
    }
    productSales[name].sold += item.quantity;
    productSales[name].revenue += Number(item.unitPrice) * item.quantity;
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5); // Top 5

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="text-primary-500" />
            Advanced Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isCustom 
              ? `Showing data from ${startDate.toLocaleDateString('en-IN')} to ${endDate.toLocaleDateString('en-IN')}` 
              : "Showing data for the Last 30 Days"}
          </p>
        </div>
      </div>
      
      <AnalyticsControls dailyData={dailyData} statusData={statusData} topProducts={topProducts} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] sm:text-xs">Total Revenue</h3>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] sm:text-xs">Total Orders</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalOrders.toLocaleString('en-IN')}</p>
        </div>

        <div className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] sm:text-xs">New Users</h3>
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalUsers.toLocaleString('en-IN')}</p>
        </div>

        <div className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] sm:text-xs">Page Views</h3>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Eye size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalVisits.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <AnalyticsCharts dailyData={dailyData} statusData={statusData} topProducts={topProducts} />
      
    </div>
  );
}
