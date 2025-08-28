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
      <div className="relative h-56 overflow-hidden rounded-3xl border border-white/10">
        {(() => { const f = getFeaturedImage(post); return f.src ? (
          <img src={f.src} alt={f.alt} className="absolute inset-0 h-full w-full object-cover" />
        ) : null })()}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60" />
        <div className="relative z-10 flex h-full items-end justify-between p-8"> 
          <div>
            <div className="text-xs text-white/80">{formatDate(post.date)}</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-wide" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          </div>
          <span className="text-6xl">🕹️</span>
        </div>
      </div>

      <div className="prose prose-invert prose-slate mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />

      <Link to="/blog" className="mt-8 inline-block rounded-full border border-white/20 px-5 py-2 text-slate-200 hover:text-cyan-300">← Back to Blog</Link>
    </div>
  );
};

export default BlogDetailPage;


