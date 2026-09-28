"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenTool, CheckCircle2, Clock, FileText, XCircle, Loader2, Zap } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("@/components/3d/ModelViewer"), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"><span className="text-slate-400 text-sm">Loading 3D...</span></div> });

export default function CustomRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/user/custom-requests");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      toast.error("Could not load your custom requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': 
      case 'REVIEWING': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} /> {status}</span>;
      case 'QUOTED': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><FileText size={12} /> Quoted</span>;
      case 'APPROVED': 
      case 'IN_PROGRESS': return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><PenTool size={12} /> {status.replace('_', ' ')}</span>;
      case 'COMPLETED': return <span className="px-2.5 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={12} /> Completed</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><XCircle size={12} /> Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => (
    type === "INSTANT_QUOTE"
      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider"><Zap size={9}/>Instant Quote</span>
      : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-wider"><PenTool size={9}/>Custom</span>
  );

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
        Loading your requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="card py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-fade-in-up">
        <PenTool size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Requests</h3>
        <p className="text-slate-500 mb-6">You haven't submitted any custom design or instant quote requests yet.</p>
        <Link href="/custom-design" className="btn-primary">
          Submit a Request
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Design & Quote Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Track the status of your bespoke 3D design and instant quote requests.</p>
        </div>
        <Link href="/custom-design" className="btn-primary shrink-0">
          New Request
        </Link>
      </div>

      <div className="space-y-6">
        {requests.map(req => (
          <div key={req.id} className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Type</p>
                  <div>{getTypeBadge(req.requestType)}</div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Submitted</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                {req.quotedPrice && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Quoted Price</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{Number(req.quotedPrice).toLocaleString('en-IN')}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Request ID</p>
                  <p className="text-sm font-mono text-slate-900 dark:text-white">#{req.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div>
                {getStatusBadge(req.status)}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{req.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 whitespace-pre-wrap">{req.description}</p>
              
              {/* 3D Preview (for the first file if available) */}
              {(req.stlFileUrl || req.fileUrl) && (
                <div className="mb-4">
                  <div className="h-48 w-full sm:w-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-50 dark:bg-slate-900/50">
                    <ModelViewer url={req.requestType === 'INSTANT_QUOTE' ? req.stlFileUrl.split(',')[0] : req.fileUrl} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                {req.material && <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">Material: {req.material}</span>}
                {req.color && <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">Color: {req.color}</span>}
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">Quantity: {req.quantity}</span>
                {req.fileUrl && req.requestType !== 'INSTANT_QUOTE' && (
                  <a href={req.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary-600 hover:underline px-2.5 py-1 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                    View Reference File
                  </a>
                )}
                {req.stlFileUrl && req.requestType === 'INSTANT_QUOTE' && (
                  req.stlFileUrl.split(',').map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-1">
                      <FileText size={12} /> Part {idx + 1}
                    </a>
                  ))
                )}
              </div>

              {req.adminNotes && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-1">Message from Admin</p>
                  <p className="text-sm text-blue-900 dark:text-blue-200">{req.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
