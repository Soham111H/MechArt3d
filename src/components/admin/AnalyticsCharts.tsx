"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

interface AnalyticsChartsProps {
  dailyData: { date: string; revenue: number; orders: number }[];
  statusData: { status: string; count: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
}

export default function AnalyticsCharts({ dailyData, statusData, topProducts }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* Revenue & Orders Line Chart */}
      <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue & Orders (Last 30 Days)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
              <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Order Status Distribution</h2>
          <div className="h-[300px] w-full flex items-center justify-center relative">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No recent orders to display.</p>
            )}
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Products (Units Sold)</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={120} tickFormatter={(val: string) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="sold" name="Units Sold" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No products sold recently.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
