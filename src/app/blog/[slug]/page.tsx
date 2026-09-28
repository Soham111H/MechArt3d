import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, User, ArrowLeft, Share2 } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title + ' — MechArt 3D Blog',
    description: post.content.slice(0, 160).replace(/[#*`]/g, ''),
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED', deletedAt: null },
    include: { author: { select: { name: true } } },
  }).catch(() => null);

  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', deletedAt: null, category: post.category || undefined, id: { not: post.id } },
    take: 3,
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <article>
          {/* Cover */}
          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-3xl mb-8 shadow-lg" />
          )}

          {/* Meta */}
          <div className="mb-6">
            {post.category && (
              <span className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-3">{post.category}</span>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><User size={14} /> {post.author?.name || 'MechArt Team'}</span>
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800 mb-8" />

          {/* Content — rendered as plain text with preserved line breaks (no HTML injection risk) */}
          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
            {post.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Share2 size={16} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Share this post:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
                X/Twitter
              </a>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rp => (
                <Link key={rp.id} href={`/blog/${rp.slug}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                  {rp.coverImage && <img src={rp.coverImage} alt={rp.title} className="w-full h-32 object-cover" />}
                  <div className="p-4">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-primary-600 transition-colors">{rp.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{rp.author?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
