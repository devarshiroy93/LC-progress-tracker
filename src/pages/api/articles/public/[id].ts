import type { NextApiRequest, NextApiResponse } from "next";

import { getOptionalAuthenticatedUser } from "@/lib/auth/optional";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid article id" });
  }

  const user = await getOptionalAuthenticatedUser(req);
  const { data, error } = await supabaseAdmin
    .from("revisions")
    .select("id, title, summary, linked_problem, content_json, code_sample, language, author_id, author_name, is_published, published_at, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Article not found" });
  }

  if (!data.is_published && data.author_id !== user?.id) {
    return res.status(403).json({ error: "This article is not public" });
  }

  return res.status(200).json({ article: data });
}
