import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostBySlug, getFeaturedImage, formatDate } from "../lib/wp";
import type { WpPost } from "../lib/wp";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<WpPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchPostBySlug(slug || "")
      .then((p) => { if (isMounted) setPost(p); })
      .catch((e) => { if (isMounted) setError(e.message || "Failed to load post"); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false };
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-slate-300">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <Link to="/blog" className="mt-4 inline-block text-cyan-300">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="relative h-56 md:h-80 overflow-hidden rounded-3xl border border-white/10">
        {(() => { const f = getFeaturedImage(post); return f.src ? (
          <img src={f.src} alt={f.alt} className="absolute inset-0 h-full w-full object-cover" />
        ) : null })()}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60" />
        <div className="relative z-10 flex h-full items-end justify-between p-8" />
      </div>
      <div className="text-xs mt-10 text-white/80">{formatDate(post.date)}</div>
      <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-100" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

      <div
  className="prose prose-invert prose-slate md:prose-lg mt-8 max-w-none
             prose-headings:text-slate-100 prose-headings:font-semibold prose-headings:tracking-tight
             prose-p:text-slate-300 prose-p:leading-relaxed
             prose-a:text-cyan-300 hover:prose-a:text-cyan-200 prose-a:no-underline hover:prose-a:underline
             prose-strong:text-slate-100 prose-em:text-slate-200
             prose-li:marker:text-slate-400 prose-ul:my-4 prose-ol:my-4
             prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-l-slate-600 prose-blockquote:text-slate-300"
  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
/>


      <Link to="/blog" className="mt-8 inline-block rounded-full border border-white/20 px-5 py-2 text-slate-200 hover:text-cyan-300">← Back to Blog</Link>
    </div>
  );
};

export default BlogDetailPage;


