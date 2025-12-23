import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Profile({ session }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);

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
    });

    setFile(null);
    setPreview(null);
    setCaption("");

    fetchPosts();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>

      <input type="file" accept="image/*,video/*" onChange={handleFileChange} />

      {preview && (
        <>
          {file.type.startsWith("video") ? (
            <video src={preview} controls width="300" />
          ) : (
            <img src={preview} width="300" />
          )}
        </>
      )}

      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button onClick={handlePost}>Post</button>

      <hr />

      <h3>Your Posts</h3>

      {posts.map((p) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          {p.content_type === "video" ? (
            <video src={p.media_url} controls width="300" />
          ) : (
            <img src={p.media_url} width="300" />
          )}
          <p>{p.caption}</p>
        </div>
      ))}
    </div>
  );
}
