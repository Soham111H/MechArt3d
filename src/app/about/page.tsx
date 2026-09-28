import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — MechArt 3D | Precision 3D Printing Company",
  description: "Learn about MechArt 3D — our story, vision, capabilities, and the team behind India's precision 3D printing service.",
};

const capabilities = [
  { icon: "🖨️", label: "FDM / FFF Printing", desc: "PLA, PETG, ABS, Nylon, TPU" },
  { icon: "🔬", label: "Resin (SLA/MSLA)", desc: "Ultra-high detail miniatures & dental" },
  { icon: "⚙️", label: "Metal 3D Printing", desc: "Stainless steel, aluminium, titanium" },
  { icon: "📐", label: "CAD Design Services", desc: "From sketch or reference to print-ready CAD" },
  { icon: "🔄", label: "Reverse Engineering", desc: "3D scanning to parametric CAD" },
  { icon: "🛠️", label: "New Product Development", desc: "Concept to validated prototype" },
  { icon: "✅", label: "Quality Inspection", desc: "Dimensional checks and inspection reports" },
  { icon: "📦", label: "Pan-India Shipping", desc: "Secure packaging and fast dispatch" },
];

const companyFAQs = [
  {
    q: "Who is MechArt 3D?",
    a: "MechArt 3D is a precision 3D printing and product development studio based in India. We serve clients across aerospace, automotive, medical, defence, and consumer product industries.",
  },
  {
    q: "Where are you located?",
    a: "Our production facility is based in India. We ship pan-India and can discuss international shipping for bulk or custom orders — contact us for details.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently our primary market is India. For international orders, please contact us directly to discuss feasibility, lead times, and shipping arrangements.",
  },
  {
    q: "What file formats do you accept?",
    a: "We accept .STL, .OBJ, .STEP, .IGES, .STP and native files from most CAD packages. If you have a sketch or rough idea, our design team can help create the model.",
  },
  {
    q: "How long does a typical order take?",
    a: "Standard orders ship within 3–7 business days. Complex custom projects with design work typically take 5–14 business days. We always confirm lead time before you place your order.",
  },
  {
    q: "Can you sign an NDA for my project?",
    a: "Absolutely. We respect intellectual property. We'll sign your NDA before reviewing any confidential design files or project briefs.",
  },
];

async function getRecentProjects() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        coverImage: true,
        content: true,
        publishedAt: true,
      },
    });
    return posts;
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const projects = await getRecentProjects();

  return (
    <main className="min-h-screen">
      {/* ── 1. Hero ── */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Breadcrumb items={[{label:'About Us'}]} className="text-primary-400 [&_a]:text-primary-400 [&_a:hover]:text-white [&_svg]:text-primary-600" />
          </div>
          <p className="text-primary-400 font-bold uppercase tracking-widest text-sm mb-5">Our Story</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            Where <span className="text-primary-400">Fundamental</span> binds<br />
            with the <span className="text-primary-400">Artistic</span> and brings<br />
            the product to exist
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            MechArt 3D was founded with one conviction: that precision manufacturing and creative design are not opposites — they're partners in bringing ideas to life.
          </p>
        </div>
      </section>

      {/* ── 2. Vision & Mission ── */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-primary-700 text-white rounded-3xl p-10">
              <div className="text-4xl mb-4">🔭</div>
              <h2 className="text-xl font-black uppercase tracking-wide mb-4">Our Vision</h2>
              <p className="text-primary-100 leading-relaxed text-lg">
                To be India's most trusted additive manufacturing partner — where every engineer, designer, and inventor can transform any idea into a precision physical product, regardless of complexity or scale.
              </p>
            </div>
            <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-10 border border-slate-800">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-xl font-black uppercase tracking-wide mb-4">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                To deliver precision, speed, and creative problem-solving to every project — combining cutting-edge 3D printing technology with deep material expertise and hands-on craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Founder ── */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-primary-700 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-10 text-center">
            Meet the Founder
          </p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
            {/* Placeholder avatar */}
            <div className="shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-primary-500 to-primary-800 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-xl">
                M
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Founder</h2>
              <p className="text-primary-700 dark:text-primary-400 font-semibold mb-6">Founder & Lead Engineer, MechArt 3D</p>
              <blockquote className="border-l-4 border-primary-500 pl-5">
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed italic">
                  "Every product starts as a thought. Our job is to give that thought its first breath as a physical object — with accuracy, with care, and with the kind of craftsmanship that makes engineers proud."
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Capabilities ── */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-700 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-3">What We Do</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Our Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {capabilities.map((cap) => (
              <div key={cap.label}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center hover:border-primary-400 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{cap.icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{cap.label}</h3>
                <p className="text-xs text-slate-500">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Real Projects ── */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-700 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-3">Portfolio</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Real Projects Completed</h2>
            <p className="text-slate-500 mt-2">A selection of recent work across industries</p>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p>Projects coming soon — check back after our first blog posts are published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Link key={project.id} href={`/blog/${project.slug}`}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-400 transition-all">
                  {project.coverImage ? (
                    <div className="h-48 overflow-hidden">
                      <img src={project.coverImage} alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-4xl">
                      🖨️
                    </div>
                  )}
                  <div className="p-5">
                    {project.category && (
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
                        {project.category}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {project.title}
                    </h3>
                    {project.content && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {project.content.replace(/<[^>]*>/g, '').slice(0, 120)}...
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 mt-3">
                      Read more <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/blog"
              className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              View All Blog Posts <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Company FAQs ── */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-700 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-3">FAQs</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Company Questions</h2>
          </div>
          <div className="space-y-3">
            {companyFAQs.map((faq, i) => (
              <details key={i}
                className="group border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors list-none">
                  {faq.q}
                  <ChevronDown size={16} className="shrink-0 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-5 pt-1">
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="text-sm font-semibold text-primary-700 dark:text-primary-400 hover:underline">
              View full FAQ centre →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. Contact CTA Banner ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Have a project in mind?
          </h2>
          <p className="text-primary-100 text-xl mb-10 leading-relaxed">
            Let's bring it to life.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-3 bg-white text-primary-700 font-black px-10 py-4 rounded-2xl text-lg hover:bg-primary-50 transition-all shadow-2xl hover:-translate-y-0.5">
            Contact Us <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
