'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2,
  Clock, ArrowRight, Rocket, Bot, Heart,
} from 'lucide-react';
import { useSettingsStore, defaultSettings } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/Breadcrumb';

const inquiryTypes = [
  { value: 'General Inquiry',        icon: MessageSquare, desc: 'Questions about our services' },
  { value: 'Custom Design Request',  icon: Rocket,        desc: 'Start a new custom project' },
  { value: 'Quote Request',          icon: ArrowRight,    desc: 'Pricing for a specific part' },
  { value: 'Technical Support',      icon: Bot,           desc: 'Issue with an existing order' },
  { value: 'Partnership',            icon: Heart,         desc: 'Business collaboration' },
];

export default function ContactPage() {
  const { settings } = useSettingsStore();
  const s = settings || defaultSettings;

  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [selectedType, setSelectedType] = useState('General Inquiry');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subject: selectedType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-5">
            <Breadcrumb items={[{label:'Contact'}]} className="text-primary-400 [&_a]:text-primary-400 [&_a:hover]:text-white [&_svg]:text-primary-600" />
          </div>
          <p className="text-primary-400 font-bold uppercase tracking-widest text-xs mb-4">Get in Touch</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Let's talk about<br />
            <span className="text-primary-400">your project</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Tell us what you need and we'll respond within one business day.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* ── Left — Info ── */}
          <aside className="lg:col-span-2 space-y-8">

            {/* Contact Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 space-y-5">
              <h2 className="font-black text-slate-900 dark:text-white text-lg">Contact Details</h2>

              {s.storeEmail && (
                <a href={`mailto:${s.storeEmail}`}
                  className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                    <Mail size={17} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {s.storeEmail}
                    </p>
                  </div>
                </a>
              )}

              {s.storePhone && (
                <a href={`tel:${s.storePhone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                    <Phone size={17} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone / WhatsApp</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {s.storePhone}
                    </p>
                  </div>
                </a>
              )}

              {s.storeAddress && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={17} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.storeAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Response Time */}
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/40 rounded-3xl p-7 space-y-4">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-primary-700 dark:text-primary-400" />
                <h3 className="font-bold text-primary-900 dark:text-primary-300">Response Time</h3>
              </div>
              <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} /> General inquiries — within 1 business day</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Quote requests — within 24 hours</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Urgent support — WhatsApp for fastest response</li>
              </ul>
            </div>

            {/* WhatsApp CTA */}
            {s.whatsappNumber && (
              <a
                href={`https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi MechArt 3D, I'd like to enquire about a project.`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-4 rounded-2xl transition-colors w-full justify-center"
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            )}
          </aside>

          {/* ── Right — Form ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={36} className="text-green-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Message sent!</h2>
                  <p className="text-slate-500 max-w-xs mb-8">
                    Thanks for reaching out. We'll get back to you within one business day.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 bg-primary-700 text-white font-bold rounded-xl hover:bg-primary-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8"
                >
                  <h2 className="font-black text-slate-900 dark:text-white text-xl mb-6">Send us a message</h2>

                  {/* Inquiry Type Selector */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      What can we help with?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {inquiryTypes.map(({ value, icon: Icon, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedType(value)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            selectedType === value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedType === value
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            <Icon size={14} />
                          </div>
                          <div>
                            <p className={`text-xs font-bold leading-none mb-0.5 ${
                              selectedType === value ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                            }`}>{value}</p>
                            <p className="text-[10px] text-slate-400 leading-none">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          id="name" name="name" type="text" required
                          value={form.name} onChange={handleChange}
                          placeholder="Your full name"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          id="email" name="email" type="email" required
                          value={form.email} onChange={handleChange}
                          placeholder="you@company.com"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Phone / WhatsApp <span className="text-slate-400 font-normal normal-case">(optional)</span>
                      </label>
                      <input
                        id="phone" name="phone" type="tel"
                        value={form.phone} onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Message *
                      </label>
                      <textarea
                        id="message" name="message" required rows={5}
                        value={form.message} onChange={handleChange}
                        placeholder="Describe your project, part requirements, materials, quantity, and any deadline…"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">{form.message.length}/5000 characters</p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-sm text-red-600 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-slate-400 text-center">
                      Your information is kept private. We never share your data with third parties.
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Bottom strip — Quick Links ── */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-slate-500 mb-6">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Submit Custom Design', href: '/custom-design' },
              { label: 'Browse Products', href: '/products' },
              { label: 'View FAQs', href: '/faq' },
              { label: 'Material Guide', href: '/material-guide' },
            ].map(link => (
              <Link
                key={link.href} href={link.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
              >
                {link.label} <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
