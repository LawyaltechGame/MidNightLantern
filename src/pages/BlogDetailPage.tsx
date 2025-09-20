import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostBySlug, getFeaturedImage, formatDate, fetchAuthorById, normalizeWpHtml, type WpAuthor } from "../lib/wp";
import CommentSection from "../components/CommentSection";
import type { WpPost } from "../lib/wp";
import { FaThumbsUp } from "react-icons/fa";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

// Skeleton component to prevent layout shifts
const ContentSkeleton = () => (
  <div className="mx-auto max-w-3xl px-4 py-12">
    <div className="space-y-6">
      {/* Hero image skeleton with exact dimensions */}
      <div className="relative w-full aspect-[16/9] md:aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-slate-800/50 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60" />
        <div className="relative z-10 flex h-full items-end justify-between p-8" />
      </div>
      
      <div className="mt-10 space-y-6">
        {/* Date skeleton */}
        <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" />
        
        {/* Title skeleton with proper line height */}
        <div className="space-y-3">
          <div className="h-9 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-9 w-4/5 bg-slate-700/50 rounded animate-pulse" />
        </div>
        
        {/* Content skeleton with reserved space */}
        <div className="space-y-4 mt-8">
          <div className="space-y-2">
            <div className="h-4 bg-slate-700/30 rounded animate-pulse" />
            <div className="h-4 bg-slate-700/30 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-slate-700/30 rounded animate-pulse" />
          </div>
          <div className="h-6 w-full bg-slate-700/20 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-700/30 rounded animate-pulse" />
            <div className="h-4 bg-slate-700/30 rounded animate-pulse" />
            <div className="h-4 w-3/5 bg-slate-700/30 rounded animate-pulse" />
          </div>
          <div className="h-4 w-full bg-slate-700/20 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-700/30 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-slate-700/30 rounded animate-pulse" />
          </div>
          
          {/* Additional content blocks to simulate full article */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 mt-6">
              <div className="h-4 bg-slate-700/25 rounded animate-pulse" />
              <div className="h-4 bg-slate-700/25 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-700/25 rounded animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Author bio skeleton */}
        <div className="mt-12 p-6 bg-slate-900/40 rounded-2xl border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-grow min-w-0 space-y-2">
              <div className="h-5 w-32 bg-slate-700/50 rounded animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 bg-slate-700/30 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-slate-700/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions skeleton */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
          <div className="h-10 w-32 bg-slate-700/40 rounded-full animate-pulse" />
          <div className="h-10 w-20 bg-slate-700/40 rounded-full animate-pulse" />
        </div>
        
        {/* Comment section skeleton */}
        <div className="mt-12 space-y-4">
          <div className="h-6 w-40 bg-slate-700/40 rounded animate-pulse" />
          <div className="space-y-3">
            <div className="h-20 bg-slate-800/30 rounded-xl animate-pulse" />
            <div className="h-16 bg-slate-800/20 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<WpPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [likes, setLikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | null>(null);
  const [fullAuthor, setFullAuthor] = useState<WpAuthor | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Memoize featured image to prevent recalculations
  const featuredImage = useMemo(() => {
    return post ? getFeaturedImage(post) : { src: '', alt: '' };
  }, [post]);

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
    setContentReady(false);
    
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    fetchPostBySlug(slug || "")
      .then((p) => { 
        if (isMounted) {
          setPost(p);
          // Add small delay to ensure content is ready before showing
          setTimeout(() => {
            if (isMounted) setContentReady(true);
          }, 100);
        }
      })
      .catch((e) => { 
        if (isMounted) setError(e.message || "Failed to load post"); 
      })
      .finally(() => { 
        if (isMounted) setLoading(false); 
      });
    
    return () => { isMounted = false };
  }, [slug]);

  // Fetch full author details if description missing in embedded data
  useEffect(() => {
    let isMounted = true;
    async function loadAuthor() {
      if (!post) { setFullAuthor(null); return; }
      const embeddedAuthor = post._embedded?.author?.[0];
      if (embeddedAuthor?.description) { setFullAuthor(embeddedAuthor); return; }
      if (embeddedAuthor?.id != null) {
        const fetched = await fetchAuthorById(embeddedAuthor.id, embeddedAuthor.slug).catch(() => null);
        if (isMounted) {
          if (!fetched?.description) {
            console.warn("Author description not available from WP API", { embeddedAuthor, fetched });
          }
          setFullAuthor(fetched);
        }
      } else {
        setFullAuthor(null);
      }
    }
    loadAuthor();
    return () => { isMounted = false };
  }, [post]);

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
        setLikes(prev => Math.max(0, prev - 1));
        setUserReaction(null);
        await deleteDoc(postRef);
      } else {
        const newLikes = likes + 1;
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
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Show skeleton while loading or content not ready
  if (loading || !contentReady) {
    return <ContentSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-100">Post not found</h2>
        <Link 
          to="/blog" 
          className="mt-4 inline-block text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="mx-auto max-w-3xl px-4 py-12"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 2000px'
      }}
    >
      {/* Hero Image Container with Fixed Aspect Ratio - Prevents CLS */}
      <div 
        className="relative w-full aspect-[16/9] md:aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-slate-800/20"
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: 'auto 400px'
        }}
      >
        {featuredImage.src && !imageError ? (
          <>
            {/* Persistent background to prevent flash */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
            
            <img 
              src={featuredImage.src} 
              alt={featuredImage.alt}
              width={1280} 
              height={720}
              sizes="(min-width: 768px) 768px, 100vw"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 300ms ease-in-out'
              }}
            />
            
            {/* Loading indicator with fixed positioning */}
            {!imageLoaded && (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)' }}
              >
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-slate-400 text-center">
              <div className="w-16 h-16 mx-auto mb-2 opacity-30">
                <svg fill="currentColor" viewBox="0 0 24 24" width="64" height="64">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
              <p className="text-sm">No featured image</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient - Fixed positioning prevents shifts */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60"
          style={{ pointerEvents: 'none' }}
        />
        <div className="relative z-10 flex h-full items-end justify-between p-8" />
      </div>

      {/* Content Container with Consistent Spacing */}
      <div className="mt-10 space-y-6">
        {/* Date with reserved space */}
        <div 
          className="text-xs text-white/80"
          style={{ minHeight: '16px' }}
        >
          {formatDate(post.date)}
        </div>
        
        {/* Title with consistent line height */}
        <h1 
          className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100"
          style={{ 
            lineHeight: '1.2',
            minHeight: '2.4em' // Reserve space for 2 lines
          }}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
        />

        {/* Article Content with Strict Layout Control */}
        <div
          className="prose prose-invert prose-slate md:prose-lg mt-8 max-w-none
                     prose-headings:text-slate-100 prose-headings:font-semibold prose-headings:tracking-tight 
                     prose-headings:mt-8 prose-headings:mb-4 prose-headings:leading-tight
                     prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4 prose-p:mt-0
                     prose-a:text-cyan-300 hover:prose-a:text-cyan-200 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-slate-100 prose-em:text-slate-200
                     prose-li:marker:text-slate-400 prose-ul:my-4 prose-ol:my-4 prose-li:mb-2
                     prose-img:rounded-xl prose-img:shadow-lg prose-img:my-6 prose-img:w-full prose-img:h-auto
                     prose-blockquote:border-l-slate-600 prose-blockquote:text-slate-300 prose-blockquote:my-6
                     prose-code:text-cyan-300 prose-code:bg-slate-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                     prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700 prose-pre:my-6"
          style={{ 
            contentVisibility: 'auto',
            containIntrinsicSize: '0 1200px',
            // Prevent layout shifts from dynamic content
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
          dangerouslySetInnerHTML={{ __html: normalizeWpHtml(post.content.rendered) }}
        />

        {/* Author Bio Section with Reserved Space */}
        {(post._embedded?.author?.[0] || fullAuthor) && (
          <div 
            className="mt-12 p-6 bg-slate-900/40 rounded-2xl border border-white/10"
            style={{
              minHeight: '96px' // Reserve minimum height
            }}
          >
            <div className="flex items-start gap-4">
              {(() => { 
                const author = fullAuthor || post._embedded!.author![0]; 
                return (
                  <>
                    <div className="flex-shrink-0">
                      <img
                        src={author.avatar_urls?.["96"]}
                        alt={author.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        className="w-16 h-16 rounded-full border border-slate-700 object-cover"
                        style={{
                          aspectRatio: '1/1',
                          backgroundColor: 'rgb(51 65 85)' // Fallback background
                        }}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg font-semibold text-slate-100 mb-2 leading-tight">
                        {author.name}
                      </h3>
                      {author?.description?.trim() ? (
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {author.description.trim()}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 italic">
                          Author bio not available.
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Actions Section with Fixed Layout */}
        <div 
          className="mt-8 pt-6 border-t border-white/10"
          style={{ minHeight: '60px' }}
        >
          <div className="flex items-center justify-between">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-slate-200 hover:text-cyan-300 hover:border-cyan-300/40 transition-colors duration-200"
              style={{
                minHeight: '40px',
                minWidth: '120px'
              }}
            >
              <span>←</span>
              <span>Back to Blog</span>
            </Link>
            
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
                style={{
                  minHeight: '40px',
                  minWidth: '60px'
                }}
              >
                <FaThumbsUp className={`w-4 h-4 ${userReaction === 'like' ? 'text-green-400' : ''}`} />
                <span>{likes}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Comment Section with Reserved Space */}
        <div 
          className="mt-12"
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '0 400px'
          }}
        >
          <CommentSection postSlug={slug || ""} />
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;