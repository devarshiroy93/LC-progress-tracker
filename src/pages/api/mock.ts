import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

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

  // ---------- Parse & validate limit ----------
  const limitParam = req.query.limit;
  const limit = limitParam ? Number(limitParam) : 3;

  if (!Number.isInteger(limit) || limit <= 0) {
    return res.status(400).json({ error: "Invalid limit" });
  }

  // ---------- Temporary single-user setup ----------
  const TEST_USER_ID = "eba3eaf4-407f-454a-9c35-56c3f91b86a4";

  // ---------- 1️⃣ Generate mock problems ----------
  const { data, error } = await supabase.rpc("get_mock_problems", {
    p_user_id: TEST_USER_ID,
    p_limit: limit,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const problems: MockProblem[] = data ?? [];

  // ---------- 2️⃣ Record problem exposure ----------
  if (problems.length > 0) {
    const exposures = problems.map((p) => ({
      user_id: TEST_USER_ID,
      problem_id: p.id,
    }));

    const { error: exposureError } = await supabase
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

  // ---------- 3️⃣ Return mock ----------
  return res.status(200).json({
    problems,
  });
}
