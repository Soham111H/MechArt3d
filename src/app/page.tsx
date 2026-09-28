// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronDown, Layers, Shield, Zap, Award,
  Star, Quote, Box, Cpu, Paintbrush, Package,
  Clock, Truck, RotateCcw, Users, MessageCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FadeIn from "@/components/ui/FadeIn";
import { cn, formatPrice } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import PopupBanner from "@/components/ui/PopupBanner";

// ─── Initial Fallback Data ────────────
const initialFeaturedProducts = [
  {
    id: "1", name: "Dragon Figurine", slug: "dragon-figurine",
    price: 1299, originalPrice: 1699, rating: 4.8, reviews: 124,
    material: "Resin", image: null,
    badge: "Bestseller",
  },
  {
    id: "2", name: "Mechanical Gear Set", slug: "mechanical-gear-set",
    price: 849, originalPrice: null, rating: 4.6, reviews: 87,
    material: "PLA", image: null,
    badge: "New",
  },
  {
    id: "3", name: "Abstract Art Vase", slug: "abstract-art-vase",
    price: 2199, originalPrice: 2599, rating: 4.9, reviews: 56,
    material: "PETG", image: null,
    badge: "Premium",
  },
  {
    id: "4", name: "Robot Articulated", slug: "robot-articulated",
    price: 3499, originalPrice: null, rating: 4.7, reviews: 43,
    material: "Resin", image: null,
    badge: null,
  },
];

const features = [
  {
    icon: Zap,
    title: "Fast Turnaround",
    desc: "Most orders printed and shipped within 3–5 business days.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    desc: "Every product passes our 10-point quality check before dispatch.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Paintbrush,
    title: "Custom Designs",
    desc: "Upload your concept — we'll engineer and print it to perfection.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: Award,
    title: "Premium Materials",
    desc: "PLA, Resin, PETG, and Metal — we print in the material you need.",
    color: "text-primary-500",
    bg: "bg-primary-50 dark:bg-primary-950/30",
  },
];

const steps = [
  {
    number: "01",
    icon: Cpu,
    title: "Choose or Design",
    desc: "Browse our catalog or submit a custom design request with your specifications.",
  },
  {
    number: "02",
    icon: Layers,
    title: "We Print & Inspect",
    desc: "Our team slices, prints, and carefully inspects every layer for perfection.",
  },
  {
    number: "03",
    icon: Package,
    title: "Packed & Shipped",
    desc: "Safely packaged with eco-friendly materials and shipped with tracking.",
  },
  {
    number: "04",
    icon: Star,
    title: "You Love It",
    desc: "Rate your product and share your creation with the MechArt 3D community.",
  },
];

const initialTestimonials = [
  {
    name: "Ravi Sharma",
    role: "Product Designer",
    text: "The quality of their resin prints is absolutely incredible. I've ordered custom figurines three times now — every single one is flawless.",
    rating: 5,
    avatar: "RS",
  },
  {
    name: "Priya Mehta",
    role: "Architect",
    text: "Used MechArt 3D for scale architectural models. Precision, material quality, and turnaround time — all exceeded expectations.",
    rating: 5,
    avatar: "PM",
  },
  {
    name: "Arjun Kapoor",
    role: "Game Designer",
    text: "They printed my game miniatures exactly as designed. The custom request process was smooth and the team was super responsive.",
    rating: 5,
    avatar: "AK",
  },
];

const stats = [
  { value: "10,000+", label: "Products Printed", icon: Box },
  { value: "2,500+", label: "Happy Customers", icon: Users },
  { value: "4.9★", label: "Average Rating", icon: Star },
  { value: "48hr", label: "Express Delivery", icon: Truck },
];

// ─── Animated Particle Background ────────────────────────────────
function HeroBackground() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Gradient blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary-700/8 dark:bg-primary-700/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] bg-blue-400/6 rounded-full blur-3xl animate-float" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(#1D4ED8 1px, transparent 1px), linear-gradient(to right, #1D4ED8 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating 3D cubes */}
      {[
        { size: 40, top: "15%", left: "8%",  delay: "0s",   opacity: 0.06 },
        { size: 24, top: "70%", left: "5%",  delay: "1.5s", opacity: 0.05 },
        { size: 32, top: "25%", right: "6%", delay: "0.8s", opacity: 0.06 },
        { size: 20, top: "60%", right: "9%", delay: "2.2s", opacity: 0.04 },
        { size: 16, top: "45%", left: "15%", delay: "1s",   opacity: 0.05 },
      ].map((cube, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            width: cube.size, height: cube.size,
            top: cube.top, left: (cube as { left?: string }).left, right: (cube as { right?: string }).right,
            animationDelay: cube.delay,
            opacity: cube.opacity,
          }}
        >
          <div className="w-full h-full border-2 border-primary-600 rounded-lg rotate-12 bg-primary-500/10" />
        </div>
      ))}
    </motion.div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────
function ProductCard({ product }: { product: typeof initialFeaturedProducts[0] }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const placeholderColors = [
    "from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50",
    "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50",
    "from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50",
    "from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50",
  ];
  const idx = product.id ? product.id.charCodeAt(product.id.length - 1) : 0;

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      className="card group overflow-hidden cursor-pointer h-full flex flex-col"
    >
      {/* Image / Placeholder */}
      <div className={cn(
        "relative h-56 bg-gradient-to-br flex items-center justify-center overflow-hidden shrink-0",
        !product.image && placeholderColors[idx % placeholderColors.length]
      )}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Box size={64} className="text-primary-400/40 dark:text-primary-400/20 group-hover:scale-110 transition-transform duration-500" />
        )}

        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={product.badge === "Bestseller" ? "blue" : product.badge === "New" ? "green" : "purple"}>
              {product.badge}
            </Badge>
          </div>
        )}

        {discount && (
          <div className="absolute top-3 right-3">
            <Badge variant="red">-{discount}%</Badge>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary-700/0 group-hover:bg-primary-700/10 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1">
          <Badge variant="gray">{product.material}</Badge>
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white mt-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={cn(
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 dark:text-slate-700"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">({product.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Link href={`/products/${product.slug}`}>
            <Button size="sm" variant="primary">Buy</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────
function TestimonialCard({ t, storeName = "MechArt 3D" }: { t: typeof initialTestimonials[0], storeName?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="card p-6 flex flex-col gap-4 h-full"
    >
      <Quote size={28} className="text-primary-200 dark:text-primary-800" />
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">
        {t.text.replace("MechArt 3D", storeName)}
      </p>
      <div className="flex items-center gap-1 mb-1">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {t.avatar}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
          <p className="text-xs text-slate-400">{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────
export default function HomePage() {
  const { settings } = useSettingsStore();
  const [featuredProducts, setFeaturedProducts] = useState(initialFeaturedProducts);
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) setFeaturedProducts(data.products);
        if (data.testimonials && data.testimonials.length > 0) setTestimonials(data.testimonials);
      })
      .catch(err => console.error("Failed to fetch real data", err));
  }, []);

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#0a0f1e] pt-16">
        <HeroBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Tag */}
          <FadeIn delay={0.1} direction="down">
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 rounded-full px-4 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 mb-8">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              {settings.storeTagline || "Premium 3D Printing & Custom Design"}
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.2}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6">
              Where{" "}
              <span className="relative inline-block">
                <span className="text-gradient">Fundamental</span>
              </span>{" "}
              binds with the{" "}
              <span className="text-gradient">Artistic</span>
            </h1>
          </FadeIn>

          {/* Tagline */}
          <FadeIn delay={0.3}>
            <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              {settings.heroSubheadline || "Discover premium 3D printed creations, order custom designs, and experience manufacturing like never before."}
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/instant-quote">
                <Button size="xl" variant="primary" className="shadow-glow-lg">
                  <span suppressHydrationWarning>Instant Quote</span> <Zap size={18} />
                </Button>
              </Link>
              <Link href="/custom-design">
                <Button size="xl" variant="secondary">
                  Custom Design <Paintbrush size={18} />
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Stats bar */}
          <FadeIn delay={0.5}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <stat.icon size={20} className="text-primary-500 mb-1" />
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
        >
          <span className="text-xs text-slate-400">Scroll</span>
          <ChevronDown size={16} className="text-slate-400" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="blue" className="mb-4">Why MechArt 3D</Badge>
            <h2 className="section-title mb-4">Crafted With Precision</h2>
            <p className="section-subtitle mx-auto">
              From concept to creation — we bring ideas to life with industry-leading materials and technology.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1} fullWidth>
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="card p-6 text-center h-full flex flex-col"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4", f.bg)}>
                    <f.icon size={26} className={f.color} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{f.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-[#0a0f1e] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="blue" className="mb-4">Popular Picks</Badge>
              <h2 className="section-title">Trending Products</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-700 dark:text-primary-400 group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.1}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2} className="text-center mt-10 sm:hidden">
            <Link href="/products">
              <Button variant="secondary" size="lg" fullWidth>
                Browse All Products <ArrowRight size={16} />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="blue" className="mb-4">The Process</Badge>
            <h2 className="section-title mb-4">How It Works</h2>
            <p className="section-subtitle mx-auto">
              Four simple steps from idea to doorstep.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-800 dark:via-primary-600 dark:to-primary-800" />

            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative w-28 h-28 mb-6"
                  >
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full bg-primary-100 dark:bg-primary-900/30 animate-pulse-slow" style={{ animationDelay: `${i * 0.5}s` }} />
                    {/* Inner circle */}
                    <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-glow">
                      <step.icon size={30} className="text-white" />
                    </div>
                    {/* Step number */}
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-white dark:bg-slate-900 border-2 border-primary-600 rounded-full flex items-center justify-center text-xs font-black text-primary-700 dark:text-primary-400">
                      {i + 1}
                    </div>
                  </motion.div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc.replace("MechArt 3D", settings.storeName)}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CUSTOM DESIGN CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <FadeIn className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <Badge className="mb-6 bg-white/20 text-white border-0">Custom Design Service</Badge>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Have a unique idea?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Upload your reference, describe your vision, and let us turn it into a beautiful 3D printed reality — quoted within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/custom-design">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary-700 font-bold text-lg rounded-2xl shadow-lg w-full sm:w-auto"
              >
                Start Custom Request →
              </motion.button>
            </Link>
            <Link href="/pricing" className="text-white/80 hover:text-white text-sm underline underline-offset-4">
              View Pricing Plans
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-[#0a0f1e] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <Badge variant="blue" className="mb-4">Customer Love</Badge>
            <h2 className="section-title mb-4">What Our Customers Say</h2>
            <p className="section-subtitle mx-auto">
              Thousands of satisfied makers, designers, and engineers trust {settings.storeName}.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.15}>
                <TestimonialCard t={t} storeName={settings.storeName} />
              </FadeIn>
            ))}
          </div>

          {/* Trust badges */}
          <FadeIn delay={0.3} direction="none" className="mt-14 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: Shield, text: "Secure Payments" },
              { icon: Truck,  text: "Pan-India Delivery" },
              { icon: RotateCcw, text: "Easy Returns" },
              { icon: Clock, text: "24/7 Support" },
              { icon: Award, text: "Quality Certified" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <item.icon size={16} className="text-primary-600 dark:text-primary-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        <FadeIn className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Box size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
            Ready to create something amazing?
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
            Join 2,500+ customers who&apos;ve brought their ideas to life with {settings.storeName}.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="xl" variant="primary" className="shadow-glow">
                Explore Products <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="ghost">
                <MessageCircle size={18} /> Talk to Us
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>
      <PopupBanner />
    </>
  );
}
