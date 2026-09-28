import Link from "next/link";
import { applications } from "@/config/nav";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications — MechArt 3D | Industry Solutions",
  description: "Discover how MechArt 3D serves aerospace, automotive, medical, defence, electronics, industrial, robotics, consumer products, and education sectors with precision 3D printing.",
};

export default function ApplicationsPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-5">
            <Breadcrumb items={[{label:'Applications'}]} className="text-primary-400 [&_a]:text-primary-400 [&_a:hover]:text-white [&_svg]:text-primary-600" />
          </div>
          <p className="text-primary-400 font-bold uppercase tracking-widest text-sm mb-4">Industry Solutions</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
            Solutions across<br />
            <span className="text-primary-400">every industry</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            From aerospace-grade titanium components to biocompatible medical devices, MechArt 3D delivers precision additive manufacturing across 9 industries.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.slug}
                href={`/applications/${app.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                  <Icon size={22} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                  {app.name}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{app.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 dark:text-primary-400 group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">Don't see your industry?</h2>
          <p className="text-primary-100 mb-8">We work with every sector. Contact us to discuss your specific application.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Get in Touch <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
