import { Heart, MessageCircle } from "lucide-react";
import CommentsSection from "./CommentsSection";

export default function PostCard({
  post,
  onToggleLike,
  onToggleComments,
  onCommentTextChange,
  onAddComment,
}) {
  return (
    <div className="border border-border">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <img
            src={post.profiles?.avatar_url || "/avatar-placeholder.png"}
            className="w-8 h-8 rounded-full border"
          />
          <span className="text-sm font-medium">{post.profiles?.username}</span>
        </div>
        <button className="text-muted text-lg">⋮</button>
      </div>

      {/* MEDIA */}
      {post.content_type === "video" ? (
        <video src={post.media_url} controls className="w-full" />
      ) : (
        <img src={post.media_url} className="w-full" />
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-4 px-3 py-2">
        <button
          onClick={() => onToggleLike(post.id, post.likedByMe)}
          className="flex items-center gap-1"
        >
          <Heart
            size={18}
            className={
              post.likedByMe ? "fill-red-500 stroke-red-500" : "stroke-fg"
            }
          />
          <span className="text-sm">{post.likeCount}</span>
        </button>

        <button onClick={() => onToggleComments(post.id)}>
          <MessageCircle size={18} />
        </button>
      </div>

      {/* CAPTION */}
      {post.caption && (
        <p className="px-3 pb-2 text-sm text-muted">{post.caption}</p>
      )}

      {/* COMMENTS */}
      {post.showComments && (
        <CommentsSection
          post={post}
          onCommentTextChange={onCommentTextChange}
          onAddComment={onAddComment}
        />
      )}
    </div>
  );
}
