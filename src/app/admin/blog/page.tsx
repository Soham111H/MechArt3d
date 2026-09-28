"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Edit, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      toast.error("Could not load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      toast.success("Post deleted");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="text-primary-500" />
            Blog Posts
          </h1>
          <p className="text-slate-500 mt-1">Manage articles and announcements.</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary whitespace-nowrap">
          <Plus size={18} /> New Post
        </Link>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Post</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No posts found.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <FileText size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        post.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {post.author?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/blog/${post.id}`} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
