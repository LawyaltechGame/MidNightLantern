import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import type { User } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  where,
  getDocs
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { FaEnvelope, FaLock, FaSignOutAlt, FaReply, FaRegHeart, FaTrash, FaUser } from "react-icons/fa";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  timestamp: Timestamp | null;
  postSlug: string;
  likes: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  timestamp: Timestamp | null;
  parentCommentId: string;
}

interface CommentSectionProps {
  postSlug: string;
}

const CommentSection = ({ postSlug }: CommentSectionProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // Listen to comments
    const commentsQuery = query(
      collection(db, "comments"),
      orderBy("timestamp", "desc")
    );

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData: Comment[] = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.postSlug === postSlug) {
          commentsData.push({
            id: doc.id,
            content: data.content,
            authorName: data.authorName,
            authorEmail: data.authorEmail,
            timestamp: data.timestamp,
            postSlug: data.postSlug,
            likes: data.likes || 0,
            replies: [] // Initialize empty, will be populated by replies listener
          });
        }
      });
      
      setComments(commentsData);
    });

    // Listen to replies separately for better performance
    const repliesQuery = query(
      collection(db, "replies"),
      orderBy("timestamp", "asc")
    );

    const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => {
      const repliesData: Reply[] = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data) {
          repliesData.push({
            id: doc.id,
            content: data.content,
            authorName: data.authorName,
            authorEmail: data.authorEmail,
            timestamp: data.timestamp,
            parentCommentId: data.parentCommentId
          });
        }
      });

      console.log('Replies fetched:', repliesData);

      // Update comments with their replies
      setComments(prevComments => {
        const updatedComments = prevComments.map(comment => ({
          ...comment,
          replies: repliesData.filter(reply => reply.parentCommentId === comment.id)
        }));
        console.log('Updated comments with replies:', updatedComments);
        return updatedComments;
      });
    });

    return () => {
      unsubscribe();
      unsubscribeComments();
      unsubscribeReplies();
    };
  }, [postSlug]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) return;
    
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Update the user's display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName.trim()
        });
      }
      setEmail("");
      setPassword("");
      setFullName("");
      setShowSignUp(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setEmail("");
      setPassword("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign in";
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "comments"), {
        content: newComment.trim(),
        authorName: user.displayName || user.email?.split('@')[0] || "Anonymous",
        authorEmail: user.email,
        timestamp: serverTimestamp(),
        postSlug,
        likes: 0,
        replies: []
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim() || !replyTo) return;

    setLoading(true);
    try {
      const replyData = {
        content: replyContent.trim(),
        authorName: user.displayName || user.email?.split('@')[0] || "Anonymous",
        authorEmail: user.email,
        timestamp: serverTimestamp(),
        parentCommentId: replyTo
      };

      console.log('Submitting reply:', replyData);
      console.log('Reply to comment ID:', replyTo);

      // Store reply in a separate collection for better performance
      const docRef = await addDoc(collection(db, "replies"), replyData);
      console.log('Reply saved with ID:', docRef.id);
      
      setReplyContent("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this comment? All replies will also be deleted.')) {
      setLoading(true);
      try {
        console.log('Starting deletion of comment:', commentId);
        
        // First, delete all replies to this comment
        const repliesQuery = query(
          collection(db, "replies"),
          where("parentCommentId", "==", commentId)
        );
        
        const repliesSnapshot = await getDocs(repliesQuery);
        console.log('Found', repliesSnapshot.docs.length, 'replies to delete');
        
        if (repliesSnapshot.docs.length > 0) {
          const deleteRepliesPromises = repliesSnapshot.docs.map((replyDoc) => {
            console.log('Deleting reply:', replyDoc.id);
            return deleteDoc(doc(db, "replies", replyDoc.id));
          });
          
          // Wait for all replies to be deleted first
          await Promise.all(deleteRepliesPromises);
          console.log('Successfully deleted', repliesSnapshot.docs.length, 'replies');
        }
        
        // Then delete the comment
        console.log('Deleting comment:', commentId);
        await deleteDoc(doc(db, "comments", commentId));
        console.log('Comment deleted successfully:', commentId);
        
        // Optimistically update the UI to remove the comment immediately
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
        
      } catch (error) {
        console.error("Error deleting comment:", error);
        // If deletion failed, show an error message with more details
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        alert(`Failed to delete comment: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this reply?')) {
      setLoading(true);
      try {
        console.log('Deleting reply:', replyId);
        await deleteDoc(doc(db, "replies", replyId));
        console.log('Reply deleted successfully:', replyId);
        
        // Optimistically update the UI to remove the reply immediately
        setComments(prevComments => 
          prevComments.map(comment => ({
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== replyId)
          }))
        );
        
      } catch (error) {
        console.error("Error deleting reply:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        alert(`Failed to delete reply: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const toggleRepliesExpanded = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  if (!user) {
    return (
      <div className="mt-16 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-slate-100 mb-2">Join the Discussion</h3>
          <p className="text-slate-300">Sign in to leave comments and engage with other readers</p>
        </div>

        {/* Auth Forms */}
        <div className="max-w-md mx-auto">
          {showSignUp ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <h4 className="text-lg font-medium text-slate-100 text-center mb-4">Create Account</h4>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaUser className="text-slate-400" />
                  <label htmlFor="signup-fullname" className="text-sm text-slate-300">Full Name</label>
                </div>
                <input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaEnvelope className="text-slate-400" />
                  <label htmlFor="signup-email" className="text-sm text-slate-300">Email</label>
                </div>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaLock className="text-slate-400" />
                  <label htmlFor="signup-password" className="text-sm text-slate-300">Password</label>
                </div>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
              </div>
              {authError && (
                <div className="text-red-400 text-sm text-center">{authError}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignUp(false);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setAuthError(null);
                  }}
                  className="text-slate-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <h4 className="text-lg font-medium text-slate-100 text-center mb-4">Sign In</h4>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaEnvelope className="text-slate-400" />
                  <label htmlFor="signin-email" className="text-sm text-slate-300">Email</label>
                </div>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaLock className="text-slate-400" />
                  <label htmlFor="signin-password" className="text-sm text-slate-300">Password</label>
                </div>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {authError && (
                <div className="text-red-400 text-sm text-center">{authError}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignUp(true);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setAuthError(null);
                  }}
                  className="text-slate-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-100">Comments</h3>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <FaSignOutAlt />
          Sign Out
        </button>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex items-start gap-4">
                     <img
             src={`https://ui-avatars.com/api/?name=${user.displayName || user.email?.split('@')[0]}&background=0ea5e9&color=fff`}
             alt={user.displayName || user.email?.split('@')[0] || "User"}
             className="w-10 h-10 rounded-full"
           />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-xl border border-white/10 bg-slate-800/60 text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
                             <span className="text-sm text-slate-400">
                 Commenting as {user.displayName || user.email?.split('@')[0]}
               </span>
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
              >
                {loading ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border border-white/10 rounded-xl p-6 bg-slate-800/30">
            <div className="flex items-start gap-4">
              <img
                src={`https://ui-avatars.com/api/?name=${comment.authorName}&background=0ea5e9&color=fff`}
                alt={comment.authorName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                     <span className="font-semibold text-slate-100">{comment.authorName}</span>
                     <span className="text-sm text-slate-400">{formatTime(comment.timestamp)}</span>
                   </div>
                   {user.email === comment.authorEmail && (
                     <button
                       onClick={() => handleDeleteComment(comment.id)}
                       disabled={loading}
                       className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 text-sm"
                       title="Delete comment"
                     >
                       <FaTrash className="w-4 h-4" />
                     </button>
                   )}
                 </div>
                <p className="text-slate-200 mb-4 leading-relaxed">{comment.content}</p>
                
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                    <FaRegHeart />
                    <span>{comment.likes}</span>
                  </button>
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <FaReply />
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {replyTo === comment.id && (
                  <form onSubmit={handleSubmitReply} className="mt-4">
                    <div className="flex items-start gap-3">
                                             <img
                         src={`https://ui-avatars.com/api/?name=${user.email?.split('@')[0]}&background=0ea5e9&color=fff`}
                         alt={user.email?.split('@')[0] || "User"}
                         className="w-8 h-8 rounded-full"
                       />
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full p-3 rounded-lg border border-white/10 bg-slate-700/60 text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo(null);
                              setReplyContent("");
                            }}
                            className="px-4 py-1 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !replyContent.trim()}
                            className="px-4 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                                 {/* Replies */}
                 {comment.replies && comment.replies.length > 0 && (
                   <div className="mt-4 space-y-3">
                     {/* Show first 3 replies always */}
                     {comment.replies.slice(0, 3).map((reply) => (
                       <div key={reply.id} className="ml-8 border-l-2 border-slate-600 pl-4">
                         <div className="flex items-center justify-between mb-1">
                           <div className="flex items-center gap-2">
                             <span className="font-medium text-slate-100">{reply.authorName}</span>
                             <span className="text-sm text-slate-400">{formatTime(reply.timestamp)}</span>
                           </div>
                           {user.email === reply.authorEmail && (
                             <button
                               onClick={() => handleDeleteReply(reply.id)}
                               disabled={loading}
                               className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 text-sm"
                               title="Delete reply"
                             >
                               <FaTrash className="w-3 h-3" />
                             </button>
                           )}
                         </div>
                         <p className="text-slate-300">{reply.content}</p>
                       </div>
                     ))}
                     
                     {/* Show "View more replies" button if more than 3 replies */}
                     {comment.replies.length > 3 && !expandedReplies.has(comment.id) && (
                       <button
                         onClick={() => toggleRepliesExpanded(comment.id)}
                         className="ml-8 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                       >
                         View {comment.replies.length - 3} more replies
                       </button>
                     )}
                     
                     {/* Show remaining replies when expanded */}
                     {comment.replies.length > 3 && expandedReplies.has(comment.id) && (
                       <>
                         {comment.replies.slice(3).map((reply) => (
                           <div key={reply.id} className="ml-8 border-l-2 border-slate-600 pl-4">
                             <div className="flex items-center justify-between mb-1">
                               <div className="flex items-center gap-2">
                                 <span className="font-medium text-slate-100">{reply.authorName}</span>
                                 <span className="text-sm text-slate-400">{formatTime(reply.timestamp)}</span>
                               </div>
                               {user.email === reply.authorEmail && (
                                 <button
                                   onClick={() => handleDeleteReply(reply.id)}
                                   disabled={loading}
                                   className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 text-sm"
                                   title="Delete reply"
                                 >
                                   <FaTrash className="w-3 h-3" />
                                 </button>
                               )}
                             </div>
                             <p className="text-slate-300">{reply.content}</p>
                           </div>
                         ))}
                         
                         {/* Show "View less" button when expanded */}
                         <button
                           onClick={() => toggleRepliesExpanded(comment.id)}
                           className="ml-8 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                         >
                           View less
                         </button>
                       </>
                     )}
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
