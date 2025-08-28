import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaNewspaper, FaBookOpen, FaComments, FaBroadcastTower, FaArrowRight } from "react-icons/fa";
import { fetchPosts, getFeaturedImage, formatDate } from "../lib/wp";
import type { WpPost } from "../lib/wp";

const PageTitle = () => (
  <div className="mb-8 text-center">
    <h1 className="text-[40px] font-extrabold tracking-widest md:text-[64px]">
      <span className="bg-gradient-to-br from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Game</span>{" "}
      <span className="bg-gradient-to-br from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Blog</span>
    </h1>
  </div>
);

const FilterPill = ({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) => (
  <motion.button
    whileHover={{ y: -2 }}
    className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors backdrop-blur-md ${
      active
        ? "border-cyan-300/70 text-cyan-200 shadow-[0_0_24px_rgba(56,189,248,0.25)]"
        : "border-white/15 text-slate-200/90 hover:text-cyan-200"
    }`}
  >
    <Icon className="text-base" />
    {label}
  </motion.button>
);

const BlogCard = ({ post, index }: { post: WpPost; index: number }) => (
  <motion.article
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-md"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ delay: index * 0.05, duration: 0.5 }}
  >
    <div className="relative h-56">
      {(() => { const f = getFeaturedImage(post); return f.src ? (
        <img src={f.src} alt={f.alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : null })()}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60" />
      <div className="relative z-10 h-full p-6 flex items-end">
        <span className="text-5xl drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]">🕹️</span>
      </div>
    </div>
    <div className="p-6">
      <div className="text-xs text-slate-400">{formatDate(post.date)}</div>
      <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-wide text-slate-100" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
      <div className="mt-3 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
      <motion.span whileHover={{ x: 4 }} className="mt-5 inline-flex">
        <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
          Read More <FaArrowRight />
        </Link>
      </motion.span>
    </div>

    {/* Decorative corner dots */}
    <span className="pointer-events-none absolute right-4 top-4 h-1 w-1 rounded-full bg-white/60" />
    <span className="pointer-events-none absolute right-6 top-8 h-1 w-1 rounded-full bg-white/40" />
    <span className="pointer-events-none absolute right-8 top-6 h-1 w-1 rounded-full bg-white/30" />
  </motion.article>
);

const BlogPage = () => {
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchPosts({ page, perPage: 6 })
      .then(({ posts, totalPages }) => {
        if (!isMounted) return;
        setPosts(posts);
        setTotalPages(totalPages);
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e.message || "Failed to load posts");
      })
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false };
  }, [page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <PageTitle />

      <div className="flex flex-wrap items-center justify-center gap-4">
      <FilterPill icon={FaComments} label="Blogs" active />
        <FilterPill icon={FaNewspaper} label="News" />
        <FilterPill icon={FaBookOpen} label="Articles" />
        <FilterPill icon={FaBroadcastTower} label="Event Coverage" />
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-extrabold tracking-wide text-cyan-300/90">Latest Gaming Blogs</h2>
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-red-300">{error}</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={`sk-${i}`} className="h-[360px] animate-pulse rounded-3xl border border-white/10 bg-slate-900/40" />
                ))
              : posts.length === 0
              ? <div className="col-span-full rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-slate-300">No posts yet. Add some in WordPress!</div>
              : posts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
          </div>
        )}

        {/* Pagination */}
        {!error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-white/15 px-4 py-2 text-sm disabled:opacity-50">Prev</button>
            <span className="text-sm text-slate-300">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-full border border-white/15 px-4 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;


