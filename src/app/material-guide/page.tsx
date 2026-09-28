import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Material Guide — MechArt 3D | Metal & Plastic 3D Printing Materials",
  description: "Compare metal and plastic 3D printing materials. Find the right material for your project — stainless steel, titanium, PLA, PETG, resin, nylon and more.",
};

export default function MaterialGuidePage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="flex justify-center mb-5">
          <Breadcrumb items={[{label:'Material Guide'}]} />
        </div>
        <p className="text-primary-700 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-4">Material Guide</p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-5">
          Choosing the right<br />
          <span className="text-primary-700 dark:text-primary-400">material for your project</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          The material you choose determines strength, weight, finish, cost, and application suitability. Our guide helps you decide quickly and confidently.
        </p>
      </section>

      {/* Two cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Metal */}
          <Link href="/material-guide/metal"
            className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-primary-500 rounded-3xl p-8 text-white transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
            <div className="text-4xl mb-5">⚙️</div>
            <h2 className="text-2xl font-black mb-3">Metal</h2>
            <p className="text-slate-400 leading-relaxed mb-5">
              Stainless steel, aluminium, titanium, Inconel and tool steel. Built for extreme strength, heat resistance, and demanding industrial applications.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Stainless Steel", "Aluminium", "Titanium", "Inconel 625"].map(m => (
                <span key={m} className="px-3 py-1 bg-slate-700 text-xs font-medium rounded-full">{m}</span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 text-primary-400 font-bold group-hover:gap-3 transition-all">
              Explore Metal Materials <ArrowRight size={16} />
            </span>
          </Link>

          {/* Plastic */}
          <Link href="/material-guide/plastic"
            className="group bg-gradient-to-br from-primary-700 to-primary-900 border border-primary-600 hover:border-primary-400 rounded-3xl p-8 text-white transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
            <div className="text-4xl mb-5">🧪</div>
            <h2 className="text-2xl font-black mb-3">Plastic</h2>
            <p className="text-primary-100 leading-relaxed mb-5">
              PLA, ABS, PETG, Resin, Nylon, and TPU. Versatile, cost-effective, and available in a wide range of properties from rigid to highly flexible.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["PLA", "PETG", "Resin", "Nylon", "TPU"].map(m => (
                <span key={m} className="px-3 py-1 bg-primary-600/60 text-xs font-medium rounded-full">{m}</span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-3 transition-all">
              Explore Plastic Materials <ArrowRight size={16} />
            </span>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Not sure which material is right for you? Our team will recommend the best option for your requirements.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-800 transition-colors">
            Get a Free Recommendation <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
