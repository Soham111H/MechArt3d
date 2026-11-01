"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Eye, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`);
      if (!res.ok) throw new Error("Failed to fetch blog post");
      const post = await res.json();
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setContent(post.content || "");
      setExcerpt(post.excerpt || "");
      setCoverImage(post.coverImage || "");
      setCategory(post.category || "");
      setStatus(post.status || "DRAFT");
      if (Array.isArray(post.tagsJson)) {
        setTagsInput(post.tagsJson.join(", "));
      } else if (post.tags) {
        setTagsInput(Array.isArray(post.tags) ? post.tags.join(", ") : String(post.tags));
      }
    } catch (error: any) {
      toast.error(error.message || "Could not load post");
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        content,
        excerpt,
        coverImage: coverImage.trim() ? coverImage.trim() : null,
        category: category.trim() ? category.trim() : null,
        status,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update post");
      }

      toast.success("Blog post updated successfully!");
      router.push("/admin/blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      toast.success("Post deleted");
      router.push("/admin/blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
        Loading blog post...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Blog Posts
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 rounded-xl transition-colors"
        >
          <Trash2 size={14} /> Delete Post
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Post Title
              </label>
              <input
                type="text"
                required
                placeholder="Post Title"
                className="w-full text-2xl md:text-3xl font-black bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-primary-500 pb-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                URL Slug
              </label>
              <div className="flex items-center text-sm font-mono bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 select-none">/blog/</span>
                <input
                  type="text"
                  required
                  className="flex-1 bg-transparent outline-none text-slate-700 dark:text-slate-300 ml-1"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-slug"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Excerpt / Summary
              </label>
              <textarea
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                rows={3}
                placeholder="Brief summary of the post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Content (Markdown supported)
              </label>
              <textarea
                required
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[400px] font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed"
                placeholder="Write your post content here in Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white">
              Publishing
            </h3>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Category
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Tutorials, Engineering, Materials"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>

            {slug && status === "PUBLISHED" && (
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye size={14} /> View Live Post
              </a>
            )}
          </div>

          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white">
              Media & Tags
            </h3>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Cover Image URL
              </label>
              <input
                type="url"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              {coverImage && (
                <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.target as any).style.display = "none")}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Tags
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="3d, printing, guide"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">Comma separated</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
