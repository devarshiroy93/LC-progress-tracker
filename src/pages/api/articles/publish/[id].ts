import type { NextApiRequest, NextApiResponse } from "next";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid article id" });
  }

  const user = await requireAuthenticatedUser(req, res);

  if (!user) {
    return;
  }

  const { publish } = req.body as { publish?: boolean };

  const { data: current, error: currentError } = await supabaseAdmin
    .from("revisions")
    .select("id, author_id")
    .eq("id", id)
    .single();

  if (currentError || !current || current.author_id !== user.id) {
    return res.status(404).json({ error: "Article not found" });
  }

  const updates = publish
    ? { is_published: true, published_at: new Date().toISOString() }
    : { is_published: false, published_at: null };

  const { data, error } = await supabaseAdmin
    .from("revisions")
    .update(updates)
    .eq("id", id)
    .select("id, is_published, published_at")
    .single();

  if (error || !data) {
    return res.status(500).json({ error: error?.message ?? "Unable to update article" });
  }

  return res.status(200).json({ article: data });
}
