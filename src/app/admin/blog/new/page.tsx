"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [tagsInput, setTagsInput] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Auto-generate slug
    setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
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
        coverImage,
        status,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      };

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create post");
      }

      toast.success("Blog post created successfully!");
      router.push("/admin/blog");
    } catch (error: any) {
      toast.error(error.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          &larr; Back to Blog
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <input 
                type="text" 
                required
                placeholder="Post Title"
                className="w-full text-3xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            
            <div>
              <div className="flex items-center text-sm">
                <span className="text-slate-400">mechart3d.com/blog/</span>
                <input 
                  type="text" 
                  required
                  className="flex-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-primary-500 outline-none font-mono text-slate-600 dark:text-slate-400"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-slug"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Excerpt</label>
              <textarea 
                className="input-base w-full p-3 border rounded-xl resize-none" 
                rows={3}
                placeholder="Brief summary of the post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Content (Markdown supported)</label>
              <textarea 
                required
                className="input-base w-full p-4 border rounded-xl min-h-[400px] font-mono text-sm" 
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Publishing</h3>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select 
                className="input-base w-full p-2 border rounded-xl"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="btn-primary w-full justify-center"
            >
              {submitting ? "Saving..." : "Save Post"}
            </button>
          </div>

          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Media & SEO</h3>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Cover Image URL</label>
              <input 
                type="url" 
                className="input-base w-full p-2 border rounded-xl" 
                placeholder="https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              {coverImage && (
                <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Tags</label>
              <input 
                type="text" 
                className="input-base w-full p-2 border rounded-xl" 
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
