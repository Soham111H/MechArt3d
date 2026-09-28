"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, BarChart3 } from 'lucide-react';

export default function AnalyticsChart({ data }: { data: any[] }) {
  const handleDownload = () => {
    const headers = ["Date", "Orders", "Revenue (INR)"];
    const csvContent = [
      headers.join(","),
      ...data.map(row => `${row.date},${row.orders},${row.revenue}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue & Orders</h2>
          <p className="text-xs text-slate-500 mt-1">Last 30 Days Performance</p>
        </div>
        <button onClick={handleDownload} className="btn-outline text-xs px-4 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800">
          <Download size={14} /> Export CSV
        </button>
      </div>
      
      <div className="w-full h-80">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <BarChart3 size={32} className="opacity-50" />
            <span>No data available for the last 30 days</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis yAxisId="left" orientation="left" stroke="#10b981" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
