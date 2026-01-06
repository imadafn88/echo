import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import { useFeed } from "../hooks/useFeed";
import { togglePostLike } from "../lib/postService";
import { fetchComments, addComment } from "../lib/commentService";
import PostCard from "../components/Postcard";
import { useEffect } from "react";

export default function Home({ session }) {
  const location = useLocation();

  const { posts, updatePost, loading, hasMore, loadNext } = useFeed({
    userId: session?.user?.id,
    locationKey: location.pathname,
  });

  /* -----------------------------
     Infinite scroll
  ------------------------------ */
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      if (
        scrollHeight - scrollTop <= clientHeight + 200 &&
        !loading &&
        hasMore
      ) {
        loadNext();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading, hasMore, loadNext]);

  /* -----------------------------
     Likes
  ------------------------------ */
  const handleLike = async (postId, liked) => {
    await togglePostLike({
      postId,
      userId: session.user.id,
      liked,
    });

    updatePost(postId, (p) => ({
      ...p,
      likedByMe: !liked,
      likeCount: liked ? p.likeCount - 1 : p.likeCount + 1,
    }));
  };

  /* -----------------------------
     Comments
  ------------------------------ */
  const toggleComments = async (postId) => {
    updatePost(postId, (p) => ({
      ...p,
      showComments: !p.showComments,
    }));

    const post = posts.find((p) => p.id === postId);
    if (!post || post.comments.length > 0) return;

    updatePost(postId, (p) => ({ ...p, loadingComments: true }));
    const comments = await fetchComments(postId);

    updatePost(postId, (p) => ({
      ...p,
      comments,
      loadingComments: false,
    }));
  };

  const handleCommentTextChange = (postId, value) => {
    updatePost(postId, (p) => ({ ...p, commentText: value }));
  };

  const handleAddComment = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post?.commentText.trim()) return;

    const comment = await addComment({
      postId,
      userId: session.user.id,
      content: post.commentText,
    });

    updatePost(postId, (p) => ({
      ...p,
      comments: [...p.comments, comment],
      commentText: "",
    }));
  };

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <div>
      <Navbar />

      <div className="max-w-xl mx-auto px-0 py-6 space-y-6">
        <h2 className="text-lg font-medium px-3">Public Feed</h2>

        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onToggleLike={handleLike}
              onToggleComments={toggleComments}
              onCommentTextChange={handleCommentTextChange}
              onAddComment={handleAddComment}
            />
          ))}
        </div>

        {loading && (
          <p className="text-sm text-muted text-center">Loading more posts…</p>
        )}
      </div>
    </div>
  );
}
