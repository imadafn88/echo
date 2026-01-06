import { useEffect, useState, useCallback } from "react";
import { fetchPublicPosts } from "../lib/postService";

export function useFeed({ userId, locationKey }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const updatePost = (postId, updater) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
  };

  const refreshFeed = useCallback(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, []);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!hasMore || !userId) return;

      setLoading(true);
      try {
        const data = await fetchPublicPosts({ page, userId });
        if (!alive) return;

        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const fresh = data.filter((p) => !ids.has(p.id));
          return [...prev, ...fresh];
        });

        if (data.length < 10) setHasMore(false);
        if (!initialized) setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [page, userId, hasMore, initialized]);

  useEffect(() => {
    if (!initialized) return;
    refreshFeed();
  }, [locationKey, initialized, refreshFeed]);

  const loadNext = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  return {
    posts,
    setPosts,
    updatePost,
    loading,
    hasMore,
    loadNext,
  };
}
