"use client";

import { useEffect, useState } from "react";
import {
  PenTool, Search, CheckCircle2, XCircle, FileText,
  Send, Loader2, ArrowRight, Zap, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("@/components/3d/ModelViewer"), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"><span className="text-slate-400 text-sm">Loading 3D...</span></div> });

export default function AdminCustomRequestsPage() {
  const [requests, setRequests]           = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("ALL");
  const [typeFilter, setTypeFilter]       = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quotePrice, setQuotePrice]       = useState("");
  const [adminNotes, setAdminNotes]       = useState("");
  const [updating, setUpdating]           = useState(false);

  useEffect(() => { fetchRequests(); }, [statusFilter, typeFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (typeFilter   !== "ALL") params.set("type",   typeFilter);
      const url = `/api/admin/custom-requests${params.toString() ? "?" + params : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      setRequests(await res.json());
    } catch {
      toast.error("Could not load requests");
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (status: string) => {
    if (!selectedRequest) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/custom-requests/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, quotedPrice: quotePrice ? Number(quotePrice) : null, adminNotes: adminNotes || null }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Marked as ${status}`);
      setSelectedRequest(null);
      fetchRequests();
    } catch {
      toast.error("Could not update request");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING:     "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      REVIEWING:   "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      QUOTED:      "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
      APPROVED:    "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
      IN_PROGRESS: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      COMPLETED:   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      REJECTED:    "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    };
    const label: Record<string, string> = {
      PENDING:'Pending',REVIEWING:'Reviewing',QUOTED:'Quote Sent',
      APPROVED:'Approved',IN_PROGRESS:'In Production',COMPLETED:'Completed',REJECTED:'Rejected',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
        {label[status] ?? status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => (
    type === "INSTANT_QUOTE"
      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider"><Zap size={9}/>Instant Quote</span>
      : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-wider"><PenTool size={9}/>Custom</span>
  );

  const filtered = requests.filter(r =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.user?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <PenTool className="text-primary-500" /> Design Requests
          </h1>
          <p className="text-slate-500 mt-1">
            Manage <span className="font-bold text-purple-600 dark:text-purple-400">Custom</span> &amp;&nbsp;
            <span className="font-bold text-blue-600 dark:text-blue-400">Instant Quote</span> requests from users.
          </p>
        </div>
        {/* Stats chips */}
        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold">
            {requests.filter(r=>r.requestType==='CUSTOM').length} Custom
          </span>
          <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold">
            {requests.filter(r=>r.requestType==='INSTANT_QUOTE').length} Instant Quote
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        {/* Status filter */}
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto no-scrollbar shrink-0">
          {["ALL","PENDING","QUOTED","APPROVED","IN_PROGRESS","COMPLETED"].map(f=>(
            <button key={f} onClick={()=>setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter===f?"bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm":"text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              {f==='ALL'?'All Statuses':f.replace('_',' ')}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0">
          {[{v:"ALL",l:"All Types"},{v:"CUSTOM",l:"Custom"},{v:"INSTANT_QUOTE",l:"Instant Quote"}].map(({v,l})=>(
            <button key={v} onClick={()=>setTypeFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${typeFilter===v?"bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input type="text" placeholder="Search title or user…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"/>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* List */}
        <div className="w-full lg:w-1/2 space-y-3">
          {loading ? (
            <div className="py-20 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-4" size={32}/>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
              <PenTool size={40} className="mx-auto mb-3 opacity-30"/>
              <p>No requests match your filters.</p>
            </div>
          ) : filtered.map(req=>(
            <div key={req.id}
              onClick={()=>{setSelectedRequest(req);setQuotePrice(req.quotedPrice||"");setAdminNotes(req.adminNotes||"");}}
              className={`p-5 border rounded-2xl cursor-pointer transition-all ${selectedRequest?.id===req.id?'bg-primary-50 dark:bg-primary-900/10 border-primary-500':'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300'}`}>
              {/* Row 1: title + status */}
              <div className="flex justify-between items-start mb-2 gap-3">
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 flex-1">{req.title}</h3>
                {getStatusBadge(req.status)}
              </div>
              {/* Type badge */}
              <div className="mb-2">{getTypeBadge(req.requestType??'CUSTOM')}</div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-3">{req.description}</p>
              {/* Meta */}
              <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>By: {req.user?.name??'Unknown'}</span>
                <div className="flex items-center gap-3">
                  {req.estimatedPrice&&<span className="text-blue-600 dark:text-blue-400 font-bold">Est: ₹{Math.round(Number(req.estimatedPrice)*83).toLocaleString('en-IN')}</span>}
                  <span>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="w-full lg:w-1/2 sticky top-24">
          {selectedRequest ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedRequest.title}</h2>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="mb-4">{getTypeBadge(selectedRequest.requestType??'CUSTOM')}</div>

                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">Description:</span>
                    <p className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="font-bold text-slate-900 dark:text-white">Material:</span> {selectedRequest.material||'Any'}</div>
                    <div><span className="font-bold text-slate-900 dark:text-white">Color:</span> {selectedRequest.color||'Any'}</div>
                    <div><span className="font-bold text-slate-900 dark:text-white">Quantity:</span> {selectedRequest.quantity}</div>
                    <div><span className="font-bold text-slate-900 dark:text-white">Budget:</span> {selectedRequest.budget?`₹${Number(selectedRequest.budget).toLocaleString('en-IN')}`:'—'}</div>
                  </div>

                  {/* Instant Quote extras */}
                  {selectedRequest.requestType==='INSTANT_QUOTE'&&(
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">⚡ Instant Quote Details</p>
                      {selectedRequest.estimatedPrice&&(
                        <div className="flex justify-between"><span className="font-bold text-slate-900 dark:text-white">Browser Estimate:</span>
                          <span className="text-blue-700 dark:text-blue-400 font-black">₹{Math.round(Number(selectedRequest.estimatedPrice)*83).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedRequest.stlFileUrl&&(
                        <div className="mt-4">
                           <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative mb-2">
                             <ModelViewer url={selectedRequest.stlFileUrl.split(',')[0]} />
                           </div>
                           <div className="flex flex-wrap gap-2 mt-2">
                             {selectedRequest.stlFileUrl.split(',').map((url: string, idx: number) => (
                               <a key={idx} href={url} download target="_blank" rel="noreferrer"
                                 className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg hover:underline">
                                 <FileText size={14}/> Download Part {idx + 1} <ExternalLink size={12}/>
                               </a>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reference file (Custom) */}
                  {selectedRequest.fileUrl&&selectedRequest.requestType!=='INSTANT_QUOTE'&&(
                    <div className="pt-2">
                      <span className="font-bold text-slate-900 dark:text-white block mb-2">Reference File:</span>
                      
                      {(selectedRequest.fileUrl.toLowerCase().endsWith('.stl') || selectedRequest.fileUrl.toLowerCase().endsWith('.obj')) ? (
                        <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative mb-3">
                          <ModelViewer url={selectedRequest.fileUrl} />
                        </div>
                      ) : null}

                      <a href={selectedRequest.fileUrl} download target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg hover:underline">
                        <FileText size={14}/> Download File <ExternalLink size={12}/>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action panel */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Admin Response</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      {selectedRequest.requestType==='INSTANT_QUOTE'?'Confirmed Price (₹)':'Quote Price (₹)'}
                    </label>
                    {selectedRequest.requestType==='INSTANT_QUOTE'&&selectedRequest.estimatedPrice&&(
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 mb-1">
                        Browser estimate: ₹{Math.round(Number(selectedRequest.estimatedPrice)*83).toLocaleString('en-IN')} — adjust if needed
                      </p>
                    )}
                    <input type="number" value={quotePrice} onChange={e=>setQuotePrice(e.target.value)}
                      placeholder="Enter final price…"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Message to Customer</label>
                    <textarea value={adminNotes} onChange={e=>setAdminNotes(e.target.value)} rows={3}
                      placeholder="Explain the quote, timeline, or any technical notes…"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"/>
                  </div>
                  <div className="flex gap-3 pt-2">
                    {['PENDING','REVIEWING'].includes(selectedRequest.status)&&(
                      <button onClick={()=>updateRequestStatus('QUOTED')} disabled={updating||!quotePrice}
                        className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {updating?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>} Send Quote
                      </button>
                    )}
                    {selectedRequest.status==='APPROVED'&&(
                      <button onClick={()=>updateRequestStatus('IN_PROGRESS')} disabled={updating}
                        className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors">
                        Start Production
                      </button>
                    )}
                    {selectedRequest.status==='IN_PROGRESS'&&(
                      <button onClick={()=>updateRequestStatus('COMPLETED')} disabled={updating}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors">
                        Mark Completed
                      </button>
                    )}
                    <button onClick={()=>updateRequestStatus('REJECTED')} disabled={updating}
                      className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold rounded-xl text-sm transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-32 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/20">
              <ArrowRight size={40} className="mb-3 text-slate-300"/>
              <p className="font-medium text-sm">Select a request to review and quote</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
