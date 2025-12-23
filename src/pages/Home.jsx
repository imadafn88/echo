import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadPublicPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (isMounted) {
        setPosts(data || []);
      }
    };

    loadPublicPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-lg font-medium">Public Feed</h2>

        {posts.length === 0 && (
          <p className="text-sm text-muted">No public posts yet.</p>
        )}

        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="border border-border p-4 space-y-2">
              {p.content_type === "video" ? (
                <video src={p.media_url} controls className="w-full" />
              ) : (
                <img src={p.media_url} className="w-full" />
              )}

              {p.caption && <p className="text-sm text-muted">{p.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
