'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterBanner() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to subscribe');
      } else {
        setSuccess(true);
        setEmail('');
        toast.success(data.message || 'Subscribed!');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 py-16 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm">
          <Mail size={26} className="text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Stay in the loop</h2>
        <p className="text-primary-100 text-lg mb-8 max-w-lg mx-auto">
          Get notified about new products, exclusive deals, and 3D printing tips — no spam, ever.
        </p>

        {success ? (
          <div className="flex items-center justify-center gap-3 text-white font-bold text-lg">
            <CheckCircle2 size={28} className="text-green-300" />
            You&apos;re subscribed! Thank you 🎉
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-white text-primary-700 font-black rounded-xl hover:bg-primary-50 transition-colors disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? 'Subscribing...' : (<>Subscribe <ArrowRight size={16} /></>)}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
