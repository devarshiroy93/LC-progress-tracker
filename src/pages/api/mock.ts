import type { NextApiRequest, NextApiResponse } from "next";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type MockProblem = {
  id: string;
  lc_number: number;
  title: string;
  statement?: string;
  example_input?: string;
  example_output?: string;
  example_explanation?: string;
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

  const limitParam = req.query.limit;
  const limit = limitParam ? Number(limitParam) : 3;

  if (!Number.isInteger(limit) || limit <= 0) {
    return res.status(400).json({ error: "Invalid limit" });
  }

  const { data, error } = await supabaseAdmin.rpc("get_mock_problems", {
    p_user_id: user.id,
    p_limit: limit,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const problems: MockProblem[] = data ?? [];

  if (problems.length > 0) {
    const exposures = problems.map((problem) => ({
      user_id: user.id,
      problem_id: problem.id,
    }));

    const { error: exposureError } = await supabaseAdmin
      .from("problem_exposures")
      .upsert(exposures, {
        onConflict: "user_id,problem_id",
      });

    if (exposureError) {
      return res.status(500).json({
        error: "Failed to record problem exposure",
      });
    }
  }

  return res.status(200).json({ problems });
}
