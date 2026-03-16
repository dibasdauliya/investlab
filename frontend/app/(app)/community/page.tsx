"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  X,
  Clock,
  ImagePlus,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  full_name: string | null;
  initials: string | null;
  avatar_url: string | null;
}

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
  profile: Profile | null;
  like_count: number;
  comment_count: number;
  user_liked: boolean;
  user_saved: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profile: Profile | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Markets", "Beginner", "Community"] as const;
const POST_CATEGORIES = ["Community", "Markets", "Beginner"] as const;

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function timeAgo(date: string): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserInitials, setCurrentUserInitials] = useState("YO");
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  // Create post
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<string>("Community");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [posting, setPosting] = useState(false);

  // Comments
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // ── Auth & init ─────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      setCurrentUserId(user.id);
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "";
      const avatarUrl = user.user_metadata?.avatar_url || null;
      setCurrentUserInitials(getInitials(name));
      setCurrentUserAvatar(avatarUrl);
      ensureProfile(user.id, name, avatarUrl);
    });
    fetchPosts();
  }, []);

  async function ensureProfile(userId: string, name: string, avatarUrl: string | null) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (!data) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: name,
        initials: getInitials(name),
        avatar_url: avatarUrl,
      });
    } else {
      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);
    }
  }

  // ── Fetch posts ─────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      // Fetch posts (no join — posts.user_id → auth.users, not profiles)
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("id, user_id, title, content, category, image_url, created_at")
        .order("created_at", { ascending: false });

      if (error || !postsData) return;

      // Fetch profiles for all post authors separately
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, initials, avatar_url")
        .in("id", userIds);
      const profileMap: Record<string, Profile> = Object.fromEntries(
        (profilesData ?? []).map((p) => [p.id, p])
      );

      // Fetch all likes & saves in parallel
      const [likesRes, savesRes] = await Promise.all([
        supabase.from("likes").select("post_id, user_id"),
        supabase.from("saves").select("post_id, user_id"),
      ]);

      // Aggregate counts
      const likeCounts: Record<string, number> = {};
      const userLiked = new Set<string>();
      for (const l of likesRes.data ?? []) {
        likeCounts[l.post_id] = (likeCounts[l.post_id] ?? 0) + 1;
        if (l.user_id === userId) userLiked.add(l.post_id);
      }

      const userSaved = new Set<string>();
      for (const s of savesRes.data ?? []) {
        if (s.user_id === userId) userSaved.add(s.post_id);
      }

      // Fetch comment counts
      const { data: commentCounts } = await supabase
        .from("comments")
        .select("post_id");

      const commentCountMap: Record<string, number> = {};
      for (const c of commentCounts ?? []) {
        commentCountMap[c.post_id] = (commentCountMap[c.post_id] ?? 0) + 1;
      }

      const formatted: Post[] = (postsData as any[]).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        title: p.title,
        content: p.content,
        category: p.category,
        image_url: p.image_url,
        created_at: p.created_at,
        profile: profileMap[p.user_id] ?? null,
        like_count: likeCounts[p.id] ?? 0,
        comment_count: commentCountMap[p.id] ?? 0,
        user_liked: userLiked.has(p.id),
        user_saved: userSaved.has(p.id),
      }));

      setPosts(formatted);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create post ─────────────────────────────────────────────────────────────

  async function handleCreatePost() {
    if (!postContent.trim() || !postTitle.trim() || !currentUserId || posting) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: currentUserId,
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
        image_url: postImageUrl.trim() || null,
      });
      if (!error) {
        setPostTitle("");
        setPostContent("");
        setPostImageUrl("");
        setShowImageInput(false);
        await fetchPosts();
      }
    } finally {
      setPosting(false);
    }
  }

  // ── Like / Save ─────────────────────────────────────────────────────────────

  async function toggleLike(postId: string, currentlyLiked: boolean) {
    if (!currentUserId) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_liked: !currentlyLiked,
              like_count: currentlyLiked ? p.like_count - 1 : p.like_count + 1,
            }
          : p
      )
    );
    if (currentlyLiked) {
      await supabase.from("likes").delete().match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: currentUserId });
    }
  }

  async function toggleSave(postId: string, currentlySaved: boolean) {
    if (!currentUserId) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, user_saved: !currentlySaved } : p))
    );
    if (currentlySaved) {
      await supabase.from("saves").delete().match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase.from("saves").insert({ post_id: postId, user_id: currentUserId });
    }
  }

  // ── Comments ────────────────────────────────────────────────────────────────

  async function toggleComments(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setCommentText("");
    setExpandedPost(postId);
    if (!commentsByPost[postId]) {
      setLoadingComments(true);
      const { data: rawComments } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      const commentUserIds = [...new Set((rawComments ?? []).map((c) => c.user_id))];
      const { data: commentProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, initials, avatar_url")
        .in("id", commentUserIds);
      const cProfileMap: Record<string, Profile> = Object.fromEntries(
        (commentProfiles ?? []).map((p) => [p.id, p])
      );
      const mapped: Comment[] = (rawComments ?? []).map((c) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        profile: cProfileMap[c.user_id] ?? null,
      }));
      setCommentsByPost((prev) => ({ ...prev, [postId]: mapped }));
      setLoadingComments(false);
    }
  }

  async function addComment(postId: string) {
    if (!commentText.trim() || !currentUserId) return;
    const text = commentText.trim();
    setCommentText("");
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: currentUserId, content: text })
      .select("id, content, created_at, user_id")
      .single();
    if (!error && data) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, initials, avatar_url")
        .eq("id", currentUserId)
        .maybeSingle();
      const newComment: Comment = {
        id: (data as any).id,
        content: (data as any).content,
        created_at: (data as any).created_at,
        profile: profileData ?? null,
      };
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), newComment],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
        )
      );
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const filteredPosts =
    filter === "All" ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Community</h1>
        <p className="mt-1 text-sm text-muted">
          Share insights, ask questions, and learn together
        </p>
      </div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex gap-3">
          <Avatar initials={currentUserInitials} src={currentUserAvatar} size="md" />
          <div className="flex-1 space-y-3">
            <input
              type="text"
              placeholder="Post title…"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            />
            <textarea
              placeholder="Share your investing experience, ask a question, or post an insight…"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            />
            <AnimatePresence>
              {showImageInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="url"
                    placeholder="Image URL (optional)…"
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="rounded-xl border border-border bg-input-bg px-3 py-1.5 text-xs font-semibold text-foreground outline-none cursor-pointer"
                >
                  {POST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowImageInput((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground"
                >
                  <ImagePlus size={13} />
                  Image
                </button>
              </div>
              <button
                disabled={!postContent.trim() || !postTitle.trim() || posting}
                onClick={handleCreatePost}
                className="flex items-center gap-2 rounded-xl bg-accent-2 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={13} />
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              filter === f
                ? "bg-accent-2 text-white shadow-sm"
                : "border border-border bg-card text-muted hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted text-sm">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPosts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              comments={commentsByPost[post.id] ?? []}
              isExpanded={expandedPost === post.id}
              commentText={expandedPost === post.id ? commentText : ""}
              loadingComments={loadingComments && expandedPost === post.id}
              currentUserInitials={currentUserInitials}
              currentUserAvatar={currentUserAvatar}
              onToggleLike={() => toggleLike(post.id, post.user_liked)}
              onToggleSave={() => toggleSave(post.id, post.user_saved)}
              onToggleComments={() => toggleComments(post.id)}
              onCommentChange={setCommentText}
              onAddComment={() => addComment(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  initials,
  src,
  size = "md",
}: {
  initials: string;
  src?: string | null;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "h-6 w-6" : "h-9 w-9";
  if (src) {
    return (
      <img
        src={src}
        referrerPolicy="no-referrer"
        className={`${cls} shrink-0 rounded-full object-cover border border-border`}
        alt={initials}
      />
    );
  }
  const textCls = size === "sm" ? "text-[9px]" : "text-xs";
  return (
    <div
      className={`${cls} ${textCls} shrink-0 flex items-center justify-center rounded-full bg-accent-2/20 text-accent-2 font-bold`}
    >
      {initials}
    </div>
  );
}

// ─── Category Badge ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Markets: "bg-accent/15 text-accent",
    Beginner: "bg-accent-2/15 text-accent-2",
    Community: "bg-muted/20 text-muted",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[category] ?? colors.Community}`}
    >
      {category}
    </span>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  index,
  comments,
  isExpanded,
  commentText,
  loadingComments,
  currentUserInitials,
  currentUserAvatar,
  onToggleLike,
  onToggleSave,
  onToggleComments,
  onCommentChange,
  onAddComment,
}: {
  post: Post;
  index: number;
  comments: Comment[];
  isExpanded: boolean;
  commentText: string;
  loadingComments: boolean;
  currentUserInitials: string;
  currentUserAvatar: string | null;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onToggleComments: () => void;
  onCommentChange: (v: string) => void;
  onAddComment: () => void;
}) {
  const authorInitials =
    post.profile?.initials || getInitials(post.profile?.full_name);
  const authorName = post.profile?.full_name || "Anonymous";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      {/* Author header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar initials={authorInitials} src={post.profile?.avatar_url} />
          <div>
            <p className="text-sm font-semibold text-foreground">{authorName}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <CategoryBadge category={post.category} />
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <Clock size={11} />
                {timeAgo(post.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="aspect-[16/10] w-full overflow-hidden bg-border">
          <img
            src={post.image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleLike}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-red-500/10"
          >
            <Heart
              size={20}
              className={`transition-colors ${
                post.user_liked ? "fill-red-500 text-red-500" : "text-foreground"
              }`}
            />
          </button>
          <button
            onClick={onToggleComments}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-accent/10"
          >
            <MessageCircle size={20} className="text-foreground" />
          </button>
        </div>
        <button
          onClick={onToggleSave}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-accent/10"
        >
          <Bookmark
            size={20}
            className={`transition-colors ${
              post.user_saved ? "fill-foreground text-foreground" : "text-foreground"
            }`}
          />
        </button>
      </div>

      {/* Like count */}
      <div className="px-4 pt-1">
        <p className="text-sm font-semibold text-foreground">
          {post.like_count.toLocaleString()} like{post.like_count !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 pt-2">
        <h3 className="text-sm font-bold leading-snug text-foreground">{post.title}</h3>
        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted">
          {post.content}
        </p>
      </div>

      {/* Comments section */}
      <div className="border-t border-border px-4 py-2.5">
        {!isExpanded && post.comment_count > 0 && (
          <button
            onClick={onToggleComments}
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            View all {post.comment_count} comment{post.comment_count !== 1 ? "s" : ""}
          </button>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2.5 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Comments ({post.comment_count})
                </span>
                <button
                  onClick={onToggleComments}
                  className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-input-bg"
                >
                  <X size={12} className="text-muted" />
                </button>
              </div>

              {/* Comment list */}
              {loadingComments ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-8 animate-pulse rounded-lg bg-input-bg" />
                  ))}
                </div>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-muted">No comments yet.</p>
                  ) : (
                    comments.map((c) => {
                      const cInitials =
                        c.profile?.initials || getInitials(c.profile?.full_name);
                      const cName = c.profile?.full_name || "Anonymous";
                      return (
                        <div key={c.id} className="flex gap-2">
                          <Avatar initials={cInitials} src={c.profile?.avatar_url} size="sm" />
                          <div>
                            <p className="text-xs">
                              <span className="font-semibold text-foreground">
                                {cName}
                              </span>{" "}
                              <span className="text-muted">{c.content}</span>
                            </p>
                            <span className="text-[10px] text-muted/70">
                              {timeAgo(c.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Add comment */}
              <div className="flex items-center gap-2 pt-1">
                <Avatar initials={currentUserInitials} src={currentUserAvatar} size="sm" />
                <input
                  type="text"
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => onCommentChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onAddComment()}
                  className="h-8 flex-1 rounded-xl border border-border bg-input-bg px-3 text-xs text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <button
                  onClick={onAddComment}
                  disabled={!commentText.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-accent-2 transition-colors hover:bg-accent-2/10 disabled:opacity-30"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
