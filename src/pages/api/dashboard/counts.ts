import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

type DashboardCounts = {
  shown_count: number;
  not_shown_count: number;
  total_problems: number;
};

type ProblemStats = {
  times_shown: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardCounts | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Single source of truth
    const { data, error } = await supabase.rpc("problem_coverage_stats");

    if (error || !data) {
      throw error;
    }

    const total = data.length;
    const shown = data.filter((row: ProblemStats) => row.times_shown > 0).length;
    const notShown = total - shown;

    // Invariant (now meaningful again)
    if (shown + notShown !== total) {
      return res.status(500).json({
        error: "Coverage invariant violated",
      });
    }

    return res.status(200).json({
      shown_count: shown,
      not_shown_count: notShown,
      total_problems: total,
    });
  } catch (err) {
    console.error("Dashboard counts error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
