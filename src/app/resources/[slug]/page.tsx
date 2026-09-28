import { resourceServices } from "@/config/nav";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return resourceServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = resourceServices.find((s) => s.slug === params.slug);
  if (!service) return { title: "Not Found" };
  return {
    title: `${service.name} — MechArt 3D`,
    description: service.description,
  };
}

export default function ResourceServicePage({ params }: Props) {
  const service = resourceServices.find((s) => s.slug === params.slug);
  if (!service) notFound();

  return (
    <main className="min-h-screen pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumb items={[{label:'Resources'},{label:service.name}]} />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white mt-6 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-400 font-bold uppercase tracking-widest text-sm mb-4">Resources</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{service.name}</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">{service.tagline}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* What is section */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            What is {service.name}?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
            {service.whatIs}
          </p>
        </section>

        {/* Our Process */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Our Process</h2>
          <div className="space-y-4">
            {service.process.map((step, i) => (
              <div key={i} className="flex items-start gap-5 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < service.process.length - 1 && (
                  <div className="absolute left-10 ml-5 mt-12" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Why MechArt 3D */}
        <section>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
            Why choose MechArt 3D for {service.name}?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {service.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 rounded-xl">
                <CheckCircle size={18} className="text-primary-600 mt-0.5 shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-black mb-3">Ready to start your project?</h2>
          <p className="text-primary-100 mb-8 text-lg">Talk to our team about your {service.name.toLowerCase()} requirements.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Contact Us <ArrowRight size={16} />
            </Link>
            <Link href="/custom-design"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Submit a Design Brief
            </Link>
          </div>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Resources
        </Link>
      </div>
    </main>
  );
}
