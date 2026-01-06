export default function CommentsSection({
  post,
  onCommentTextChange,
  onAddComment,
}) {
  return (
    <div className="px-3 pb-3 space-y-3 border-t border-border">
      {/* Loading */}
      {post.loadingComments && (
        <p className="text-xs text-muted">Loading comments…</p>
      )}

      {/* Comment list */}
      {post.comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <img
            src={c.profiles?.avatar_url || "/avatar-placeholder.png"}
            className="w-6 h-6 rounded-full"
            alt="avatar"
          />
          <p className="text-sm">
            <span className="font-medium mr-1">{c.profiles?.username}</span>
            {c.content}
          </p>
        </div>
      ))}

      {/* Add comment */}
      <div className="flex gap-2">
        <input
          value={post.commentText}
          onChange={(e) => onCommentTextChange(post.id, e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 border border-border bg-transparent px-2 py-1 text-sm"
        />
        <button onClick={() => onAddComment(post.id)} className="text-sm">
          Post
        </button>
      </div>
    </div>
  );
}
