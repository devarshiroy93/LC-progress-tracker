import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { problem_id, status, attempt_time_seconds } = req.body;

  if (!problem_id || !status || attempt_time_seconds == null) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const TEST_USER_ID = 'eba3eaf4-407f-454a-9c35-56c3f91b86a4'
  const { error } = await supabase.from("attempts").insert({
    user_id: TEST_USER_ID,
    problem_id,
    status,
    attempt_time_seconds
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
