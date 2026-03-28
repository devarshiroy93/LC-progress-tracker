import type { NextApiRequest, NextApiResponse } from "next";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ArticlePayload = {
  title: string;
  linkedProblem: string;
  summary: string;
  contentJson: unknown;
  codeSample: string;
  language: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid article id" });
  }

  const user = await requireAuthenticatedUser(req, res);

  if (!user) {
    return;
  }

  const { data: current, error: currentError } = await supabaseAdmin
    .from("revisions")
    .select("id, author_id, title, linked_problem, summary, content_json, code_sample, language, is_published")
    .eq("id", id)
    .single();

  if (currentError || !current || current.author_id !== user.id) {
    return res.status(404).json({ error: "Article not found" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ article: current });
  }

  if (req.method === "PUT") {
    const { title, linkedProblem, summary, contentJson, codeSample, language } =
      req.body as ArticlePayload;

    if (!title || !summary || !contentJson || !language) {
      return res.status(400).json({ error: "Missing required article fields" });
    }

    const { data, error } = await supabaseAdmin
      .from("revisions")
      .update({
        title,
        linked_problem: linkedProblem || null,
        summary,
        content_json: contentJson,
        code_sample: codeSample || "",
        language,
      })
      .eq("id", id)
      .eq("author_id", user.id)
      .select("id, title, is_published, updated_at")
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message ?? "Unable to update article" });
    }

    return res.status(200).json({ article: data });
  }

  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin
      .from("revisions")
      .delete()
      .eq("id", id)
      .eq("author_id", user.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
