import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limitParam = req.query.limit;
  const limit = limitParam ? Number(limitParam) : 3;

  if (Number.isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: "Invalid limit" });
  }

  const TEST_USER_ID = 'eba3eaf4-407f-454a-9c35-56c3f91b86a4'
  const { data, error } = await supabase.rpc(
    "get_mock_problems",
    {
      p_user_id: TEST_USER_ID,
      p_limit: limit
    }
  );

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  return res.status(200).json({
    problems: data ?? []
  });
}
