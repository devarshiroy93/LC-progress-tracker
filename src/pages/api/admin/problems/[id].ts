import type { NextApiRequest, NextApiResponse } from "next";

import { requireAdminUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid problem id" });
  }

  const user = await requireAdminUser(req, res);

  if (!user) {
    return;
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("problems")
      .select("id, lc_number, title, statement, example_input, example_output, example_explanation")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Problem not found" });
    }

    return res.status(200).json({ problem: data });
  }

  if (req.method === "PUT") {
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
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabaseAdmin
      .from("problems")
      .update({
        lc_number,
        title,
        statement,
        example_input,
        example_output,
        example_explanation,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message ?? "Unable to update problem" });
    }

    return res.status(200).json({ success: true, problem: data });
  }

  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin.from("problems").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
