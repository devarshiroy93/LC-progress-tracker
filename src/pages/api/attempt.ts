import type { NextApiRequest, NextApiResponse } from "next";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAuthenticatedUser(req, res);

  if (!user) {
    return;
  }

  const { problem_id, status, attempt_time_seconds } = req.body;

  if (!problem_id || !status || attempt_time_seconds == null) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { error } = await supabaseAdmin.from("attempts").insert({
    user_id: user.id,
    problem_id,
    status,
    attempt_time_seconds,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
