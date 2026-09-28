import Link from "next/link";
import { metalMaterials } from "@/config/nav";
import { ArrowRight, CheckCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metal 3D Printing Materials — MechArt 3D",
  description: "Compare stainless steel, aluminium, titanium, Inconel, and tool steel for 3D printing. Find the right metal material for aerospace, medical, automotive and industrial applications.",
};

export default function MetalMaterialPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumb items={[{label:'Material Guide',href:'/material-guide'},{label:'Metal'}]} />
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
        <p className="text-primary-700 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-4">Material Guide</p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-5">
          Metal 3D Printing<br />
          <span className="text-primary-700 dark:text-primary-400">Materials</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Metal additive manufacturing enables complex geometries impossible by traditional CNC machining, with full-density parts at near-net-shape accuracy.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        {/* Comparison Table */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Material Comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-5 py-4 font-bold">Material</th>
                  <th className="text-center px-4 py-4 font-bold">Strength</th>
                  <th className="text-center px-4 py-4 font-bold">Weight</th>
                  <th className="text-center px-4 py-4 font-bold">Heat Resistance</th>
                  <th className="text-center px-4 py-4 font-bold">Relative Cost</th>
                  <th className="text-left px-4 py-4 font-bold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {metalMaterials.map((mat, i) => (
                  <tr key={mat.name}
                    className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"}>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{mat.name}</td>
                    <td className="px-4 py-4 text-center text-yellow-500">{mat.strength}</td>
                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{mat.weight}</td>
                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{mat.heatResistance}</td>
                    <td className="px-4 py-4 text-center font-mono text-green-600 dark:text-green-400">{mat.cost}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{mat.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to choose metal */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">When to choose metal over plastic</h2>
            <ul className="space-y-4">
              {[
                "Part requires load-bearing strength under repeated stress",
                "Operating temperatures exceed 150°C",
                "High-pressure or fluid-carrying applications",
                "Biocompatible implant or surgical instrument",
                "Electrical conductivity or EMI shielding is required",
                "Surface hardness or abrasion resistance is critical",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-primary-600 mt-0.5 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-8">
            <h3 className="font-black text-lg mb-4">Not sure?</h3>
            <p className="text-slate-300 text-sm mb-6">Our engineers review your application and recommend the optimal material and process — for free.</p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              Get Material Advice <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-800 to-primary-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-black mb-3">Ready to print in metal?</h2>
          <p className="text-slate-300 mb-6">Upload your file and we'll quote it in 24 hours.</p>
          <Link href="/custom-design"
            className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-slate-100 transition-colors">
            Start a Custom Design <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
