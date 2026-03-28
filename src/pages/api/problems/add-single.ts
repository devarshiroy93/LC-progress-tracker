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

  const {
    lc_number,
    title,
    statement,
    example_input,
    example_output,
    example_explanation,
  } = req.body;

  if (
    !lc_number ||
    !title ||
    !statement ||
    !example_input ||
    !example_output ||
    !example_explanation
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  const { data, error } = await supabaseAdmin
    .from("problems")
    .insert([
      {
        lc_number,
        title,
        statement,
        example_input,
        example_output,
        example_explanation,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  return res.status(200).json({
    success: true,
    problem: data,
  });
}
