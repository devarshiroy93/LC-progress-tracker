import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

type DashboardCounts = {
  shown_count: number;
  not_shown_count: number;
  total_problems: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardCounts | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /**
     * Step 1: total problems
     */
    const { count: totalProblems, error: totalError } = await supabase
      .from("problems")
      .select("*", { count: "exact", head: true });

    if (totalError || totalProblems === null) {
      throw totalError;
    }

    /**
     * Step 2: distinct problems that have appeared in attempts
     */
    const { data: shownProblems, error: shownError } = await supabase
      .from("attempts")
      .select("problem_id", { count: "exact" })
      .not("problem_id", "is", null);

    if (shownError) {
      throw shownError;
    }

    const uniqueShown = new Set(
      shownProblems?.map((row) => row.problem_id)
    );

    const shownCount = uniqueShown.size;
    const notShownCount = totalProblems - shownCount;

    /**
     * Invariant check (fail loud)
     */
    if (shownCount + notShownCount !== totalProblems) {
      return res.status(500).json({
        error: "Coverage invariant violated",
      });
    }

    return res.status(200).json({
      shown_count: shownCount,
      not_shown_count: notShownCount,
      total_problems: totalProblems,
    });
  } catch (err) {
    console.error("Dashboard counts error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
