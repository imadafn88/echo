import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

const PAGE_SIZE = 10;

export default function Home({ session }) {
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /* -----------------------------
     Reset feed (used for live refresh)
  ------------------------------ */
  const refreshFeed = () => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  };

  /* -----------------------------
     Fetch posts (pagination)
  ------------------------------ */
  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      if (!hasMore || !session?.user?.id) return;

      setLoading(true);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles(username, avatar_url),
          likes(count),
          user_liked: likes(user_id)
        `
        )
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!isMounted) return;

      if (!error && data) {
        const enriched = data.map((p) => ({
          ...p,
          likeCount: p.likes?.[0]?.count || 0,
          likedByMe: p.user_liked?.some((l) => l.user_id === session.user.id),
        }));

        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = enriched.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }

        if (!initialized) setInitialized(true);
      }

      setLoading(false);
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, session?.user?.id]);

  /* -----------------------------
     Infinite scroll
  ------------------------------ */
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      if (
        scrollHeight - scrollTop <= clientHeight + 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  /* -----------------------------
     Live refresh on navigation
  ------------------------------ */
  useEffect(() => {
    if (!initialized) return;
    refreshFeed();
  }, [location.pathname]);

  /* -----------------------------
     Like toggle (optimistic)
  ------------------------------ */
  const toggleLike = async (postId, liked) => {
    if (!session?.user?.id) return;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", session.user.id);
    } else {
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: session.user.id,
      });
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !liked,
              likeCount: liked ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      )
    );
  };

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <div>
      <Navbar />

      <div className="max-w-xl mx-auto px-0 py-6 space-y-6">
        <h2 className="text-lg font-medium px-3">Public Feed</h2>

        {posts.length === 0 && !loading && (
          <p className="text-sm text-muted text-center">No public posts yet.</p>
        )}

        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="border border-border">
              {/* 🔹 TOP BAR */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <img
                    src={p.profiles?.avatar_url || "/avatar-placeholder.png"}
                    className="w-8 h-8 rounded-full border object-cover"
                    alt="avatar"
                  />
                  <span className="text-sm font-medium">
                    {p.profiles?.username || "unknown"}
                  </span>
                </div>

                <button className="text-muted text-lg">⋮</button>
              </div>

              {/* 🔹 MEDIA */}
              {p.content_type === "video" ? (
                <video src={p.media_url} controls className="w-full" />
              ) : (
                <img src={p.media_url} className="w-full" />
              )}

              {/* 🔹 ACTIONS */}
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  onClick={() => toggleLike(p.id, p.likedByMe)}
                  className="flex items-center gap-1"
                >
                  <Heart
                    size={18}
                    className={
                      p.likedByMe ? "fill-red-500 stroke-red-500" : "stroke-fg"
                    }
                  />
                  <span className="text-sm">{p.likeCount}</span>
                </button>
              </div>

              {/* 🔹 CAPTION */}
              {p.caption && (
                <p className="px-3 pb-3 text-sm text-muted">{p.caption}</p>
              )}
            </div>
          ))}
        </div>

        {loading && (
          <p className="text-sm text-muted text-center">Loading more posts…</p>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-sm text-muted text-center">
            You’ve reached the end
          </p>
        )}
      </div>
    </div>
  );
}
