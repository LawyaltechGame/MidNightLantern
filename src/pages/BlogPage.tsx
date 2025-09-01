import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaNewspaper, FaBookOpen, FaComments, FaBroadcastTower, FaArrowRight, FaThumbsUp, FaEnvelope, FaLock, FaSignOutAlt, FaUser } from "react-icons/fa";
import { fetchPosts, getFeaturedImage, formatDate } from "../lib/wp";
import type { WpPost } from "../lib/wp";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, type User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";

const PageTitle = () => (
  <div className="mb-8 text-center">
    <h1 className="text-[40px] font-extrabold tracking-widest md:text-[64px]">
      <span className="bg-gradient-to-br from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Game</span>{" "}
      <span className="bg-gradient-to-br from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Blog</span>
    </h1>
  </div>
);

const FilterPill = ({ icon: Icon, label, active }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) => (
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

const BlogCard = ({ post, index, user, onLike, likes, userReaction, postReactions }: { 
  post: WpPost; 
  index: number;
  user: User | null;
  onLike: (postId: number) => void;
  likes: number;
  userReaction: 'like' | null;
  postReactions: Record<number, { likes: number; userReaction: 'like' | null }>;
}) => (
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
        <span className="text-5xl drop-shadow-[0_0_12px_rgba(0,0,12px_rgba(0,0,0,0.6)]">🕹️</span>
      </div>
    </div>
    <div className="p-6">
    <div className="flex items-center justify-between">
  <div className="flex flex-col">
    <span className="text-xs text-slate-400">{formatDate(post.date)}</span>
    {post._embedded?.author?.[0] && (
      <span className="text-sm text-blue-500 mt-1">
        By {post._embedded.author[0].name}
      </span>
    )}
  </div>

  <div className="text-xs text-slate-500">
    {(postReactions[post.id]?.likes || 0) > 0 && (
      <span className="flex items-center gap-1">
        <span>🔥</span>
        <span>{postReactions[post.id]?.likes || 0}</span>
      </span>
    )}
  </div>
</div>
      <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-wide text-slate-100" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
      <div className="mt-3 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
      
      {/* Like Section */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => user ? onLike(post.id) : null}
            disabled={!user}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              userReaction === 'like'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
            } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                         title={user ? (userReaction === 'like' ? 'Click to unlike' : 'Like this post') : 'Sign in to like'}
          >
            <FaThumbsUp className={`w-3.5 h-3.5 ${userReaction === 'like' ? 'text-green-400' : ''}`} />
            <span>{likes}</span>
          </button>
        </div>
        
        <motion.span whileHover={{ x: 4 }} className="inline-flex">
          <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
            Read More <FaArrowRight />
          </Link>
        </motion.span>
      </div>
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
  const [user, setUser] = useState<User | null>(null);
  const [postReactions, setPostReactions] = useState<Record<number, { likes: number; userReaction: 'like' | null }>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load reactions for posts
  useEffect(() => {
    if (!posts.length) return;
    
    // Initialize default reactions for all posts
    const initialReactions: Record<number, { likes: number; userReaction: 'like' | null }> = {};
    posts.forEach(post => {
      initialReactions[post.id] = { likes: 0, userReaction: null };
    });
    setPostReactions(initialReactions);
    
         const unsubscribePromises = posts.map(post => {
       const postRef = doc(db, "postReactions", post.id.toString());
       return onSnapshot(postRef, (doc) => {
         if (doc.exists()) {
           const data = doc.data();
           setPostReactions(prev => ({
             ...prev,
             [post.id]: {
               likes: data.likes || 0,
               userReaction: user && data.userReactions?.[user.uid] === 'like' ? 'like' : null
             }
           }));
         } else {
           // Document was deleted, reset to default state
           setPostReactions(prev => ({
             ...prev,
             [post.id]: {
               likes: 0,
               userReaction: null
             }
           }));
         }
       });
     });

    return () => {
      unsubscribePromises.forEach(unsubscribe => unsubscribe());
    };
  }, [posts, user]);

  const handleLike = async (postId: number) => {
    if (!user) return;
    
    const postRef = doc(db, "postReactions", postId.toString());
    const currentReaction = postReactions[postId]?.userReaction;
    
    try {
      if (currentReaction === 'like') {
        // Remove like - delete the entire document
        // Optimistic update: immediately remove like
        setPostReactions(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            likes: Math.max(0, (prev[postId]?.likes || 1) - 1),
            userReaction: null
          }
        }));
        await deleteDoc(postRef);
      } else {
        // Add like
        const newLikes = (postReactions[postId]?.likes || 0) + 1;
        
        // Optimistic update: immediately add like
        setPostReactions(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            likes: newLikes,
            userReaction: 'like'
          }
        }));
        
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user's display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
      }
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <PageTitle />

      <div className="flex flex-wrap items-center justify-center gap-4">
        <FilterPill icon={FaComments} label="Blogs" active />
        <FilterPill icon={FaNewspaper} label="News" />
        <FilterPill icon={FaBookOpen} label="Articles" />
        <FilterPill icon={FaBroadcastTower} label="Event Coverage" />
      </div>
      
             {/* Sign-in prompt for like/dislike features */}
       {!user && (
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-6 text-center"
         >
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/50 border border-slate-600/30 text-slate-300">
             <span>🔐</span>
             <span className="text-sm">Sign in to like and dislike posts</span>
             <button 
               onClick={() => setShowAuthModal(true)}
               className="ml-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-medium rounded-full transition-colors"
             >
               Sign In
             </button>
           </div>
         </motion.div>
       )}

               {/* User info and sign out */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/50 border border-slate-600/30 text-slate-300">
              <span>👤</span>
              <span className="text-sm">Signed in as {user.displayName || user.email}</span>
              <button 
                onClick={handleSignOut}
                className="ml-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-full transition-colors flex items-center gap-1"
              >
                <FaSignOutAlt className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}

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
                  <BlogCard 
                    key={post.id} 
                    post={post} 
                    index={i}
                    user={user}
                    onLike={handleLike}
                    likes={postReactions[post.id]?.likes || 0}
                    userReaction={postReactions[post.id]?.userReaction || null}
                    postReactions={postReactions}
                  />
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

       {/* Authentication Modal */}
       {showAuthModal && (
         <div 
           className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
           onClick={() => setShowAuthModal(false)}
         >
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-100">
                 {isSignUp ? "Create Account" : "Sign In"}
               </h3>
               <button
                 onClick={() => setShowAuthModal(false)}
                 className="text-slate-400 hover:text-slate-300 text-2xl"
               >
                 ×
               </button>
             </div>

                           <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">
                   Password
                 </label>
                 <div className="relative">
                   <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                   <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                     placeholder="Enter your password"
                   />
                 </div>
               </div>

               {authError && (
                 <div className="text-red-400 text-sm bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                   {authError}
                 </div>
               )}

               <button
                 type="submit"
                 disabled={authLoading}
                 className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
               >
                 {authLoading ? "Loading..." : (isSignUp ? "Create Account" : "Sign In")}
               </button>
             </form>

                           <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setAuthError(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
           </motion.div>
         </div>
       )}
     </div>
   );
 };

export default BlogPage;


