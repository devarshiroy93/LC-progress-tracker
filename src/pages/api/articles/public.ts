import type { NextApiRequest, NextApiResponse } from "next";

import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, error } = await supabaseAdmin
    .from("revisions")
    .select("id, title, summary, author_name, linked_problem, is_published, published_at, created_at, updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ articles: data ?? [] });
}
