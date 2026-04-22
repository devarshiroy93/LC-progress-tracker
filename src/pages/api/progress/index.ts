import type { NextApiRequest, NextApiResponse } from "next";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await requireAuthenticatedUser(req, res);

  if (!user) {
    return;
  }

  if (req.method === "GET") {
    const [progressResult, problemsResult] = await Promise.all([
      supabaseAdmin
        .from("progress_entries")
        .select("id, problem_id, lc_number, heading, solved_on, created_at")
        .eq("user_id", user.id)
        .order("solved_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(30),
      supabaseAdmin
        .from("problems")
        .select("id, lc_number, title")
        .order("lc_number", { ascending: true }),
    ]);

    if (progressResult.error) {
      return res.status(500).json({ error: progressResult.error.message });
    }

    if (problemsResult.error) {
      return res.status(500).json({ error: problemsResult.error.message });
    }

    return res.status(200).json({
      entries: progressResult.data ?? [],
      problems: problemsResult.data ?? [],
    });
  }

  if (req.method === "POST") {
    const { problem_id, lc_number, heading, solved_on } = req.body;

    if (!lc_number || !heading || !solved_on) {
      return res.status(400).json({ error: "LC number, heading, and date are required" });
    }

    const { data, error } = await supabaseAdmin
      .from("progress_entries")
      .insert({
        user_id: user.id,
        problem_id: problem_id || null,
        lc_number: Number(lc_number),
        heading,
        solved_on,
      })
      .select("id, problem_id, lc_number, heading, solved_on, created_at")
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message ?? "Unable to save progress" });
    }

    return res.status(200).json({ entry: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
