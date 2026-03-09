import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type ProblemDetailRow = {
  id: string;
  title: string;
  lc_number: number;
  statement: string;
  example_input: string;
  example_output: string;
  example_explanation: string;
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

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid problem id" });
  }

  try {
    const { data, error } = await supabase
      .from("problems")
      .select(`
    id,
    title,
    lc_number,
    statement,
    example_input,
    example_output,
    example_explanation`)
      .eq("id", id)
      .single();
    console.log("Supabase error:", error);
    console.log("Supabase data:", data);
    if (error || !data) {
      return res.status(404).json({ error: "Problem not found" });
    }

    return res.status(200).json(data as ProblemDetailRow);
  } catch (err) {
    console.error("Problem detail API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}