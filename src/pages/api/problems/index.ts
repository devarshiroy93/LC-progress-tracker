import type { NextApiRequest, NextApiResponse } from "next";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ProblemCoverageRow = {
  id: string;
  title: string;
  lc_number: number;
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

  const { filter } = req.query;

  if (filter !== "shown" && filter !== "not_shown") {
    return res.status(400).json({ error: "Invalid filter" });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("problem_coverage_stats", {
      p_user_id: user.id,
    });

    const typedData = data as ProblemCoverageRow[] | null;

    if (error || !typedData) {
      throw error;
    }

    const filtered = typedData.filter((row) =>
      filter === "shown" ? row.times_shown > 0 : row.times_shown === 0
    );

    return res.status(200).json(filtered);
  } catch (err) {
    console.error("Problems API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
