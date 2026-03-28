import type { NextApiRequest, NextApiResponse } from "next";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ProblemDetailRow = {
  id: string;
  title: string;
  lc_number: number;
  statement: string;
  example_input: string;
  example_output: string;
  example_explanation: string;
  times_shown: number;
  last_shown_at: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAuthenticatedUser(req, res);

  if (!user) {
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid problem id" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("problems")
      .select(
        "id, title, lc_number, statement, example_input, example_output, example_explanation"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const { count, error: countError } = await supabaseAdmin
      .from("problem_exposures")
      .select("id", { count: "exact", head: true })
      .eq("problem_id", id)
      .eq("user_id", user.id);

    if (countError) {
      return res.status(500).json({ error: countError.message });
    }

    const { data: latestExposure, error: exposureError } = await supabaseAdmin
      .from("problem_exposures")
      .select("shown_at")
      .eq("problem_id", id)
      .eq("user_id", user.id)
      .order("shown_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (exposureError) {
      return res.status(500).json({ error: exposureError.message });
    }

    return res.status(200).json({
      ...(data as Omit<ProblemDetailRow, "times_shown" | "last_shown_at">),
      times_shown: count ?? 0,
      last_shown_at: latestExposure?.shown_at ?? null,
    } satisfies ProblemDetailRow);
  } catch (err) {
    console.error("Problem detail API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
