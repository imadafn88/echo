import { supabase } from "../supabaseClient";

const PAGE_SIZE = 10;

export async function fetchPublicPosts({ page, userId }) {
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

  if (error) throw error;

  return data.map((p) => ({
    ...p,
    likeCount: p.likes?.[0]?.count || 0,
    likedByMe: p.user_liked?.some((l) => l.user_id === userId),
    showComments: false,
    comments: [],
    loadingComments: false,
    commentText: "",
  }));
}

export async function togglePostLike({ postId, userId, liked }) {
  if (liked) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
  } else {
    await supabase.from("likes").insert({
      post_id: postId,
      user_id: userId,
    });
  }
}
