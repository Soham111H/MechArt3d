import Link from "next/link";
import { plasticMaterials } from "@/config/nav";
import { ArrowRight, CheckCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plastic 3D Printing Materials — MechArt 3D",
  description: "Compare PLA, ABS, PETG, Resin, Nylon, and TPU for 3D printing. Find the right plastic material for prototypes, functional parts, miniatures, and consumer products.",
};

export default function PlasticMaterialPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumb items={[{label:'Material Guide',href:'/material-guide'},{label:'Plastic'}]} />
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
        <p className="text-primary-700 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-4">Material Guide</p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-5">
          Plastic 3D Printing<br />
          <span className="text-primary-700 dark:text-primary-400">Materials</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          From rapid concept models to flexible, durable end-use parts — plastic 3D printing materials offer unmatched versatility at accessible cost.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        {/* Comparison Table */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Material Comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-700 text-white">
                  <th className="text-left px-5 py-4 font-bold">Material</th>
                  <th className="text-center px-4 py-4 font-bold">Strength</th>
                  <th className="text-center px-4 py-4 font-bold">Flexibility</th>
                  <th className="text-center px-4 py-4 font-bold">Surface Finish</th>
                  <th className="text-center px-4 py-4 font-bold">Relative Cost</th>
                  <th className="text-left px-4 py-4 font-bold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {plasticMaterials.map((mat, i) => (
                  <tr key={mat.name}
                    className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"}>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{mat.name}</td>
                    <td className="px-4 py-4 text-center text-yellow-500">{mat.strength}</td>
                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{mat.flexibility}</td>
                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{mat.finish}</td>
                    <td className="px-4 py-4 text-center font-mono text-green-600 dark:text-green-400">{mat.cost}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{mat.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to choose plastic */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">When to choose plastic over metal</h2>
            <ul className="space-y-4">
              {[
                "Rapid prototyping where speed and cost matter most",
                "Lightweight parts where weight saving is critical",
                "Complex visual or aesthetic surface required",
                "Consumer product where skin-contact and colour are important",
                "Educational or demonstration models",
                "Low-load functional parts with moderate temperature exposure",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-primary-600 mt-0.5 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-primary-700 text-white rounded-2xl p-8">
            <h3 className="font-black text-lg mb-4">Need guidance?</h3>
            <p className="text-primary-100 text-sm mb-6">Tell us about your project and we'll recommend the right plastic, process, and surface treatment.</p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
              Get Material Advice <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-black mb-3">Ready to start printing?</h2>
          <p className="text-primary-100 mb-6">Upload your design and receive a quote within 24 hours.</p>
          <Link href="/custom-design"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Start a Custom Design <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
