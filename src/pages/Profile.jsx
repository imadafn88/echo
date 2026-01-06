import Navbar from "../components/Navbar";

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Profile({ session }) {
  const [toast, setToast] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Fetch user posts
  const fetchPosts = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    let isMounted = true; // prevents state update after unmount

    const loadPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (isMounted) {
        setPosts(data || []);
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);
  // ✅ re-run when user changes

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handlePost = async () => {
    if (!file || !session?.user?.id) return;

    const isVideo = file.type.startsWith("video");
    const bucket = isVideo ? "post-videos" : "post-images";
    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      alert("Upload failed");
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

    await supabase.from("posts").insert({
      user_id: session.user.id,
      content_type: isVideo ? "video" : "image",
      media_url: data.publicUrl,
      caption,
      visibility,
    });
    showToast("Post published");

    setFile(null);
    setPreview(null);
    setCaption("");
    setVisibility("public");
    fetchPosts();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <>
        <Navbar />
        {/* <div className="max-w-xl mx-auto px-4 py-6 space-y-6">...</div> */}
      </>

      {toast && (
        <div className="fixed bottom-6 right-6 border border-fg bg-bg px-4 py-2 text-sm">
          {toast}
        </div>
      )}
      <h2 className="text-lg font-medium">Profile</h2>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="text-sm"
      />

      {preview && (
        <div className="border border-border">
          {file.type.startsWith("video") ? (
            <video src={preview} controls className="w-full" />
          ) : (
            <img src={preview} className="w-full" />
          )}
        </div>
      )}

      <textarea
        row={3}
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full border border-border px-3 py-2 text-sm focus:border-fg focus:outline-none resize-none"
      />

      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={visibility === "public"}
            onChange={() => setVisibility("public")}
          />
          <span>Public</span>
        </label>

        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={visibility === "private"}
            onChange={() => setVisibility("private")}
          />
          <span>Private</span>
        </label>
      </div>

      <button
        onClick={handlePost}
        className="border border-fg bg-fg text-bg px-4 py-2 text-sm hover:bg-bg hover:text-fg transition"
      >
        Post
      </button>

      <hr />

      <h3>Your Posts</h3>

      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="border border-border p-4 space-y-2">
            {p.content_type === "video" ? (
              <video src={p.media_url} controls className="w-full" />
            ) : (
              <img src={p.media_url} className="w-full" />
            )}

            <div className="flex items-center justify-between text-sm text-muted">
              <p>{p.caption}</p>
              <span className="uppercase text-xs border border-border px-2 py-0.5">
                {p.visibility}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
