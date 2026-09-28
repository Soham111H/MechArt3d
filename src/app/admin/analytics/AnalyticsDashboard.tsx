"use client";

import { useState, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, ShoppingCart, XCircle, DollarSign, Users, Globe,
  Download, BarChart3, Package, RefreshCw, Activity,
} from "lucide-react";

// ── Colour palettes ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING:          "#f59e0b",
  CONFIRMED:        "#3b82f6",
  PRINTING:         "#6366f1",
  QUALITY_CHECK:    "#8b5cf6",
  PACKED:           "#06b6d4",
  SHIPPED:          "#10b981",
  OUT_FOR_DELIVERY: "#22c55e",
  DELIVERED:        "#16a34a",
  CANCELLED:        "#ef4444",
};
const PIE_FALLBACK = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#06b6d4","#22c55e"];

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold">{p.dataKey === "revenue" ? fmt(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Download helpers ───────────────────────────────────────────────────────────
function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(r => keys.map(k => r[k]).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function downloadChartAsPNG(ref: React.RefObject<HTMLDivElement | null>, name: string) {
  if (!ref.current) return;
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(ref.current, { backgroundColor: "#ffffff", scale: 2 });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${name}-${new Date().toISOString().split("T")[0]}.png`;
    a.click();
  } catch {
    alert("PNG export unavailable. Try CSV instead.");
  }
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, border, sub }: any) {
  return (
    <div className={`bg-white dark:bg-slate-900 border ${border} rounded-2xl p-5 shadow-sm flex flex-col gap-3`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, onDownloadCSV, onDownloadPNG, chartRef }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download size={13} /> Export
          </button>
          {open && (
            <div className="absolute right-0 top-9 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 w-40">
              {onDownloadCSV && (
                <button onClick={() => { onDownloadCSV(); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ⬇ Download CSV
                </button>
              )}
              {onDownloadPNG && (
                <button onClick={() => { onDownloadPNG(); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  🖼 Download PNG
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div ref={chartRef} className="p-6">
        {children}
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
interface Props {
  stats: {
    totalRevenue: number; totalOrders: number; cancelledOrders: number;
    avgOrderValue: number; totalUsers: number; totalVisitors: number; activeVisitors: number;
  };
  dailyData: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: any[];
  topProducts: { name: string; sold: number }[];
}

const DATE_RANGES = [
  { label: "7 days",  days: 7  },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export default function AnalyticsDashboard({ stats, dailyData, ordersByStatus, recentOrders, topProducts }: Props) {
  const [rangeDays, setRangeDays]   = useState(30);
  const revenueRef  = useRef<HTMLDivElement>(null);
  const ordersRef   = useRef<HTMLDivElement>(null);
  const pieRef      = useRef<HTMLDivElement>(null);
  const topRef      = useRef<HTMLDivElement>(null);

  // Slice data by selected date range
  const slicedDaily = dailyData.slice(-rangeDays);

  const statCards = [
    { label: "Total Revenue",      value: fmt(stats.totalRevenue),                     icon: DollarSign,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40" },
    { label: "Total Orders",       value: stats.totalOrders.toString(),                icon: ShoppingCart, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",      border: "border-blue-200 dark:border-blue-800/40" },
    { label: "Avg Order Value",    value: fmt(stats.avgOrderValue),                    icon: TrendingUp,   color: "text-primary-600", bg: "bg-primary-50 dark:bg-primary-900/20",border: "border-primary-200 dark:border-primary-800/40" },
    { label: "Cancelled",          value: stats.cancelledOrders.toString(),            icon: XCircle,      color: "text-red-600",     bg: "bg-red-50 dark:bg-red-900/20",        border: "border-red-200 dark:border-red-800/40" },
    { label: "Total Customers",    value: stats.totalUsers.toLocaleString(),           icon: Users,        color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20",  border: "border-violet-200 dark:border-violet-800/40" },
    { label: "Active Now (15m)",   value: stats.activeVisitors.toString(),             icon: Activity,     color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20",    border: "border-amber-200 dark:border-amber-800/40",  sub: `${stats.totalVisitors} total unique visitors` },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Date Range Picker */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Range:</span>
        {DATE_RANGES.map(r => (
          <button
            key={r.days}
            onClick={() => setRangeDays(r.days)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${rangeDays === r.days ? "bg-primary-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Revenue Area Chart */}
      <ChartCard
        title="Revenue Trend"
        subtitle={`Last ${rangeDays} days`}
        chartRef={revenueRef}
        onDownloadCSV={() => downloadCSV(slicedDaily, `revenue-${rangeDays}d.csv`)}
        onDownloadPNG={() => downloadChartAsPNG(revenueRef, "revenue-chart")}
      >
        <div className="h-72">
          {slicedDaily.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400"><BarChart3 size={32} className="opacity-30 mr-3" />No revenue data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={slicedDaily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} interval={Math.ceil(slicedDaily.length / 8)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      {/* Orders Bar Chart */}
      <ChartCard
        title="Daily Orders"
        subtitle={`Last ${rangeDays} days`}
        chartRef={ordersRef}
        onDownloadCSV={() => downloadCSV(slicedDaily.map(d => ({ date: d.date, orders: d.orders })), `orders-${rangeDays}d.csv`)}
        onDownloadPNG={() => downloadChartAsPNG(ordersRef, "orders-chart")}
      >
        <div className="h-64">
          {slicedDaily.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400"><BarChart3 size={32} className="opacity-30 mr-3" />No order data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slicedDaily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} interval={Math.ceil(slicedDaily.length / 8)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      {/* Bottom row: Pie chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Order Status Donut */}
        <ChartCard
          title="Orders by Status"
          chartRef={pieRef}
          onDownloadCSV={() => downloadCSV(ordersByStatus.map(o => ({ status: o.status, count: o.count })), "orders-by-status.csv")}
          onDownloadPNG={() => downloadChartAsPNG(pieRef, "orders-status")}
        >
          {ordersByStatus.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400">No orders yet</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ordersByStatus.map(o => ({ name: o.status.replace(/_/g," "), value: o.count }))}
                      dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} strokeWidth={0}>
                      {ordersByStatus.map((o, i) => (
                        <Cell key={o.status} fill={STATUS_COLORS[o.status] ?? PIE_FALLBACK[i % PIE_FALLBACK.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [v, "Orders"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {ordersByStatus.map((o, i) => (
                  <div key={o.status} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: STATUS_COLORS[o.status] ?? PIE_FALLBACK[i % PIE_FALLBACK.length] }} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{o.status.replace(/_/g," ")}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{o.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Top Products Horizontal Bar */}
        <ChartCard
          title="Top Selling Products"
          subtitle="By units sold (all time)"
          chartRef={topRef}
          onDownloadCSV={() => downloadCSV(topProducts, "top-products.csv")}
          onDownloadPNG={() => downloadChartAsPNG(topRef, "top-products")}
        >
          {topProducts.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400"><Package size={32} className="opacity-30 mr-3" />No sales data</div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} width={110} />
                  <Tooltip formatter={(v: any) => [v, "Units Sold"]} />
                  <Bar dataKey="sold" name="Units Sold" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary-500" /> Recent Orders
          </h2>
          <button onClick={() => downloadCSV(
            recentOrders.map(o => ({ id: o.id, customer: o.user?.name, email: o.user?.email, status: o.status, total: o.total, date: o.createdAt })),
            "recent-orders.csv"
          )} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <Download size={12} /> CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                {["Order ID", "Customer", "Date", "Status", "Total"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No orders yet.</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white text-xs">{order.user?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                      style={{ background: (STATUS_COLORS[order.status] ?? "#6366f1") + "20", color: STATUS_COLORS[order.status] ?? "#6366f1" }}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white text-xs">₹{Number(order.total).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
