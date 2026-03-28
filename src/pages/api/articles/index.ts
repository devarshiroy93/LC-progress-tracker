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

async function getAuthorName(userId: string) {
  const { data: author, error } = await supabaseAdmin
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  if (error || !author) {
    throw new Error("Unable to resolve article author");
  }

  return author.name;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const user = await requireAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const { title, linkedProblem, summary, contentJson, codeSample, language } =
      req.body as ArticlePayload;

    if (!title || !summary || !contentJson || !language) {
      return res.status(400).json({ error: "Missing required article fields" });
    }

    try {
      const authorName = await getAuthorName(user.id);
      const { data, error } = await supabaseAdmin
        .from("revisions")
        .insert({
          author_id: user.id,
          author_name: authorName,
          title,
          linked_problem: linkedProblem || null,
          summary,
          content_json: contentJson,
          code_sample: codeSample || "",
          language,
          is_published: false,
        })
        .select("id, title, is_published, updated_at")
        .single();

      if (error || !data) {
        return res.status(500).json({ error: error?.message ?? "Unable to save article" });
      }

      return res.status(200).json({ article: data });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unable to save article" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
