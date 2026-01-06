import { supabase } from "../supabaseClient";

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      profiles(username, avatar_url)
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function addComment({ postId, userId, content }) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    .select(
      `
      id,
      content,
      created_at,
      profiles(username, avatar_url)
    `
    )
    .single();

  if (error) throw error;
  return data;
}
