"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download, Calendar, Filter } from "lucide-react";

interface AnalyticsControlsProps {
  dailyData: any[];
  statusData: any[];
  topProducts: any[];
}

export default function AnalyticsControls({ dailyData, statusData, topProducts }: AnalyticsControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentYear = searchParams.get("year") || new Date().getFullYear().toString();
  const currentMonth = searchParams.get("month") || "ALL"; // ALL means whole year or last 30 days if neither selected

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.push(`/admin/analytics?${params.toString()}`);
  };

  const handleDownloadCSV = () => {
    // Basic CSV Generation
    let csv = "Report Type,Date/Name,Value/Count,Revenue\n";
    
    csv += "--- Daily Revenue & Orders ---\n";
    dailyData.forEach(d => {
      csv += `Daily,${d.date},${d.orders},${d.revenue}\n`;
    });

    csv += "\n--- Order Status ---\n";
    statusData.forEach(s => {
      csv += `Status,${s.status},${s.count},\n`;
    });

    csv += "\n--- Top Products ---\n";
    topProducts.forEach(p => {
      csv += `Product,${p.name.replace(/,/g, '')},${p.sold},${p.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Analytics_Report_${currentYear}_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Filter size={18} className="text-slate-400" />
        <select 
          name="year" 
          value={currentYear} 
          onChange={handleFilterChange}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl px-3 py-2 outline-none focus:border-primary-500"
        >
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>

        <select 
          name="month" 
          value={currentMonth} 
          onChange={handleFilterChange}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl px-3 py-2 outline-none focus:border-primary-500"
        >
          <option value="ALL">All Year</option>
          <option value="0">January</option>
          <option value="1">February</option>
          <option value="2">March</option>
          <option value="3">April</option>
          <option value="4">May</option>
          <option value="5">June</option>
          <option value="6">July</option>
          <option value="7">August</option>
          <option value="8">September</option>
          <option value="9">October</option>
          <option value="10">November</option>
          <option value="11">December</option>
        </select>
      </div>

      <button 
        onClick={handleDownloadCSV}
        className="ml-auto w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
      >
        <Download size={16} />
        Export CSV
      </button>
    </div>
  );
}
