import { useParams, Link } from "react-router-dom";
import { findPostById } from "../data/posts";

const BlogDetailPage = () => {
  const params = useParams();
  const post = findPostById(params.id || "");

  if (!post) {
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
        <img src={post.imageUrl} alt="banner" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60" />
        <div className="relative z-10 flex h-full items-end justify-between p-8"> 
          <div>
            <div className="text-xs text-white/80">{post.date}</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-wide">{post.title}</h1>
          </div>
          <span className="text-6xl">{post.iconEmoji}</span>
        </div>
      </div>

      <div className="prose prose-invert prose-slate mt-8 max-w-none">
        {post.content.map((p, idx) => (
          <p key={idx} className="text-slate-200/90">{p}</p>
        ))}
      </div>

      <Link to="/blog" className="mt-8 inline-block rounded-full border border-white/20 px-5 py-2 text-slate-200 hover:text-cyan-300">← Back to Blog</Link>
    </div>
  );
};

export default BlogDetailPage;


