import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

const PAGE_SIZE = 10;

export default function Home() {
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /* -----------------------------
     Helper: reset feed (live refresh)
  ------------------------------ */
  const refreshFeed = () => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  };

  /* -----------------------------
     Fetch posts (pagination core)
     Triggered ONLY by page change
  ------------------------------ */
  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      if (!hasMore) return;

      setLoading(true);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!isMounted) return;

      if (!error && data) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = data.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }

        if (!initialized) {
          setInitialized(true);
        }
      }

      setLoading(false);
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // ⬅️ pagination trigger ONLY

  /* -----------------------------
     Infinite scroll listener
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
     UI
  ------------------------------ */
  return (
    <div>
      <Navbar />

      <div className="max-w-xl mx-auto px-0 py-6 space-y-6">
        <h2 className="text-lg font-medium">Public Feed</h2>

        {posts.length === 0 && !loading && (
          <p className="text-sm text-muted">No public posts yet.</p>
        )}

        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="border border-border p-0 space-y-2">
              {p.content_type === "video" ? (
                <video src={p.media_url} controls className="w-full" />
              ) : (
                <img src={p.media_url} className="w-full" />
              )}

              {p.caption && <p className="text-sm text-muted">{p.caption}</p>}
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
