import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostBySlug, getFeaturedImage, formatDate } from "../lib/wp";
import CommentSection from "../components/CommentSection";
import type { WpPost } from "../lib/wp";
import { FaThumbsUp } from "react-icons/fa";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<WpPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [likes, setLikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | null>(null);

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  // Load reactions for the current post
  useEffect(() => {
    if (!post) return;
    
    const postRef = doc(db, "postReactions", post.id.toString());
    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLikes(data.likes || 0);
        setUserReaction(user && data.userReactions?.[user.uid] === 'like' ? 'like' : null);
      } else {
        // Document was deleted, reset to default state
        setLikes(0);
        setUserReaction(null);
      }
    });

    return () => unsubscribe();
  }, [post, user]);

  const handleLike = async () => {
    if (!user || !post) return;
    
    const postRef = doc(db, "postReactions", post.id.toString());
    const currentReaction = userReaction;
    
    try {
      if (currentReaction === 'like') {
        // Remove like - delete the entire document
        // Optimistic update: immediately remove like
        setLikes(prev => Math.max(0, prev - 1));
        setUserReaction(null);
        await deleteDoc(postRef);
      } else {
        // Add like
        const newLikes = likes + 1;
        
        // Optimistic update: immediately add like
        setLikes(newLikes);
        setUserReaction('like');
        
        const newData = {
          likes: newLikes,
          userReactions: {
            [user.uid]: 'like'
          }
        };
        await setDoc(postRef, newData, { merge: true });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert optimistic update on error
      // The onSnapshot listener will sync the correct state
    }
  };


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


{/* Author bio section */}
{post._embedded?.author?.[0] && (
  <div className="mt-12 flex items-start gap-4 p-6 bg-slate-900/40 rounded-2xl border border-white/10">
    <img
      src={post._embedded.author[0].avatar_urls?.["96"]}
      alt={post._embedded.author[0].name}
      className="w-16 h-16 rounded-full border border-slate-700 object-cover"
    />
    <div>
      <h3 className="text-lg font-semibold text-slate-100">
        {post._embedded.author[0].name}
      </h3>
      {post._embedded.author[0].description && (
        <p className="text-sm text-slate-400 mt-1">
          {post._embedded.author[0].description}
        </p>
      )}
    </div>
  </div>
)}



      <div className="mt-8 flex items-center justify-between">
        <Link to="/blog" className="inline-block rounded-full border border-white/20 px-5 py-2 text-slate-200 hover:text-cyan-300">← Back to Blog</Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              userReaction === 'like'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
            } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            title={user ? (userReaction === 'like' ? 'Click to unlike' : 'Like this post') : 'Sign in to like'}
          >
            <FaThumbsUp className={`w-4 h-4 ${userReaction === 'like' ? 'text-green-400' : ''}`} />
            <span>{likes}</span>
          </button>
        </div>
      </div>
      
      <CommentSection postSlug={slug || ""} />
    </div>
  );
};

export default BlogDetailPage;


