import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { CalendarDays, User, ArrowRight } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const metadata = {
  title: 'Blog — MechArt 3D',
  description: 'Tips, tutorials, and news about 3D printing from the MechArt 3D team.',
};

export default async function BlogPage({ searchParams }: { searchParams: { page?: string; category?: string } }) {
  const page     = Math.max(1, parseInt(searchParams?.page || '1'));
  const category = searchParams?.category || '';
  const limit    = 9;
  const skip     = (page - 1) * limit;

  const where: any = { status: 'PUBLISHED', deletedAt: null };
  if (category) where.category = category;

  const [posts, total, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }).catch(() => []),
    prisma.blogPost.count({ where }).catch(() => 0),
    prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, category: { not: null } },
      distinct: ['category'],
      select: { category: true },
    }).then(rows => rows.map(r => r.category).filter(Boolean)).catch(() => [] as string[]),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Breadcrumb items={[{label:'Blog'}]} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Blog</h1>
          <p className="text-slate-500 text-lg">3D printing tips, product updates, and more.</p>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                !category ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500'
              }`}
            >
              All
            </Link>
            {categories.map(cat => (
              <Link
                key={cat}
                href={`/blog?category=${cat}`}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  category === cat ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg font-medium">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 h-full flex flex-col">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                      <span className="text-4xl">✍️</span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {post.category && (
                      <span className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">{post.category}</span>
                    )}
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-auto">
                      <span className="flex items-center gap-1.5"><User size={12} /> {post.author?.name || 'Team'}</span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link href={`/blog?page=${page - 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:border-primary-500 transition-colors">
                Previous
              </Link>
            )}
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={`/blog?page=${page + 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:border-primary-500 transition-colors">
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
