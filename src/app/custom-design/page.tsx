'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Upload, PenTool, Lightbulb, MessageSquare, CheckCircle2, Loader2,
  Image as ImageIcon, FileText, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '@/store/useSettingsStore';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function CustomDesignPage() {
  const { settings } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    material: '',
    color: '',
    quantity: 1,
    budget: '',
    fileUrl: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, fileUrl: data.url }));
      toast.success('Reference file uploaded');
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          budget: formData.budget ? Number(formData.budget) : undefined,
          requestType: 'CUSTOM',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setSuccess(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pt-24">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 text-center">Request Received!</h1>
        <p className="text-slate-500 text-center max-w-lg mb-8">
          Our engineering team will review your brief and get back to you with a quote within 24–48 hours.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/account/orders" className="btn-primary">View My Requests</Link>
          <Link href="/" className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 transition-colors">
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-24">

      {/* Hero */}
      <div className="bg-primary-900 text-white py-14 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[{ label: 'Products', href: '/products' }, { label: 'Custom Design' }]}
            className="mb-6 text-primary-300 [&_a]:text-primary-300 [&_a:hover]:text-white [&_svg]:text-primary-500"
          />

          {/* Comparison banner */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="inline-flex items-center gap-2 bg-primary-800/60 border border-primary-700 px-4 py-2 rounded-full text-sm font-bold text-primary-200">
              <PenTool size={14} /> Custom — You have ideas &amp; reference images
            </span>
            <Link href="/instant-quote"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-bold text-white hover:bg-white/20 transition-colors">
              Have an STL/OBJ file? → Instant Quote <ArrowRight size={13} />
            </Link>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            Custom Design<br />
            <span className="text-primary-300">from Scratch</span>
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl">
            No 3D model? No problem. Share your idea, sketch, or reference image — our engineers will design and 3D print exactly what you need.
          </p>
        </div>
      </div>

      {/* How it differs */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/40 rounded-2xl p-5">
            <p className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">✓ This Form Is For You If…</p>
            <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-300">
              {['You have a sketch, reference image or photo', 'You have a written idea / concept', 'You need our team to create the 3D model for you', 'You have a sample or broken part to replicate'].map(t => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 size={13} className="mt-0.5 shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Already Have a 3D File?</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              If you already have an STL or OBJ file ready, use our Instant Quote tool — you'll get a price estimate in seconds.
            </p>
            <Link href="/instant-quote"
              className="inline-flex items-center gap-2 bg-primary-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-primary-800 transition-colors">
              Go to Instant Quote <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 md:p-10">

          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Tell Us About Your Project</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Project Title *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleInputChange}
                placeholder="e.g. Custom bracket for motorcycle, D&D miniature"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Describe Your Idea *
                <span className="font-normal text-slate-400 ml-1">— the more detail, the better the quote</span>
              </label>
              <textarea required rows={5} name="description" value={formData.description} onChange={handleInputChange}
                placeholder="What is this part/object? What dimensions do you have in mind? What is it used for? Any specific features needed?"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm" />
            </div>

            {/* Reference file upload — images/PDF only */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Reference File / Sketch / Photo
                <span className="font-normal text-slate-400 ml-1">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative">
                <input type="file" onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,.pdf" />
                <ImageIcon size={28} className="mx-auto text-slate-400 mb-3" />
                {uploading ? (
                  <p className="font-bold text-primary-500 flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Uploading…
                  </p>
                ) : formData.fileUrl ? (
                  <p className="font-bold text-green-500 flex items-center justify-center gap-2">
                    <CheckCircle2 size={15} /> Reference file attached
                  </p>
                ) : (
                  <>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Click or drag a file here</p>
                    <p className="text-xs text-slate-500">JPG, PNG, PDF — max 10 MB<br />Sketches, reference photos, drawings all accepted</p>
                  </>
                )}
              </div>
            </div>

            {/* Material */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Preferred Material</label>
              <select name="material" value={formData.material} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm">
                <option value="">Let the expert decide</option>
                <option value="PLA">PLA (Standard)</option>
                <option value="ABS">ABS (Durable / Heat Resistant)</option>
                <option value="PETG">PETG (Flexible / Strong)</option>
                <option value="TPU">TPU (Rubber-like)</option>
                <option value="RESIN">Resin (High Detail)</option>
                <option value="NYLON">Nylon</option>
                <option value="METAL">Metal (Stainless Steel / Aluminium)</option>
              </select>
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Preferred Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleInputChange}
                placeholder="e.g. Matte Black, Transparent, Any"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantity *</label>
              <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Budget (₹) <span className="font-normal text-slate-400">Optional</span></label>
              <input type="number" name="budget" value={formData.budget} onChange={handleInputChange}
                placeholder="e.g. 5000"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" disabled={loading || uploading}
              className="btn-primary w-full py-4 text-base flex justify-center items-center gap-2">
              {loading ? <><Loader2 size={20} className="animate-spin" /> Submitting…</> : <><Lightbulb size={20} /> Submit Custom Request</>}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              No commitment. We'll review your brief and send a free quote within 24–48 hours.
            </p>
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {[
            { icon: PenTool, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', title: 'Expert Designers', desc: 'Our engineers create the 3D model from your brief and optimize it for printing.' },
            { icon: MessageSquare, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', title: 'Direct Communication', desc: 'Chat directly with the maker handling your project throughout the process.' },
            { icon: CheckCircle2, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', title: 'Quality Guarantee', desc: 'If the final print doesn\'t match the agreed specs, we reprint it for free.' },
          ].map(card => (
            <div key={card.title} className="text-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className={`w-11 h-11 ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <card.icon size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{card.title}</h3>
              <p className="text-xs text-slate-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
