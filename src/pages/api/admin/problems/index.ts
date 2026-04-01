import type { NextApiRequest, NextApiResponse } from "next";

import { requireAdminUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAdminUser(req, res);

  if (!user) {
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("problems")
    .select("id, lc_number, title, statement, example_input, example_output, example_explanation")
    .order("lc_number", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ problems: data ?? [] });
}
