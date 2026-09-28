import { applications } from "@/config/nav";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return applications.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = applications.find((a) => a.slug === params.slug);
  if (!app) return { title: "Not Found" };
  return {
    title: `${app.name} — MechArt 3D | 3D Printing Solutions`,
    description: app.description,
    openGraph: { title: `${app.name} 3D Printing Solutions | MechArt 3D`, description: app.description },
  };
}

const materialLabels: Record<string, { label: string; href: string }> = {
  metal: { label: "Metal (Stainless Steel, Titanium, Aluminium)", href: "/material-guide/metal" },
  plastic: { label: "Plastic (PLA, PETG, Nylon, Resin, TPU)", href: "/material-guide/plastic" },
};

export default function ApplicationDetailPage({ params }: Props) {
  const app = applications.find((a) => a.slug === params.slug);
  if (!app) notFound();

  const Icon = app.icon;

  return (
    <main className="min-h-screen pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-0">
        <Breadcrumb items={[{label:'Applications',href:'/applications'},{label:app.name}]} />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white mt-6 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon size={28} className="text-primary-400" />
          </div>
          <p className="text-primary-400 font-bold uppercase tracking-widest text-sm mb-3">Industry Application</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{app.name}</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">{app.heroTagline}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Why section */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
            Why <span className="text-primary-700 dark:text-primary-400">{app.name}</span> chooses MechArt 3D
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {app.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <CheckCircle size={18} className="text-primary-600 mt-0.5 shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Common Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {app.useCases.map((uc, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 rounded-xl">
                <span className="w-7 h-7 bg-primary-600 text-white text-xs font-bold rounded-lg flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{uc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Materials */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Commonly Used Materials</h2>
          <div className="flex flex-wrap gap-3">
            {app.materials.map((mat) => {
              const m = materialLabels[mat];
              return (
                <Link
                  key={mat}
                  href={m.href}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                >
                  {m.label} <ArrowRight size={13} />
                </Link>
              );
            })}
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Visit our <Link href="/material-guide" className="text-primary-700 dark:text-primary-400 underline">Material Guide</Link> for full specifications and comparisons.
          </p>
        </section>
      </div>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-600 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            Have a project in the {app.name} space?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">Let's talk about your requirements and how we can help.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Contact Us <ArrowRight size={16} />
            </Link>
            <Link href="/custom-design"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Start a Custom Design
            </Link>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/applications" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to All Applications
        </Link>
      </div>
    </main>
  );
}
