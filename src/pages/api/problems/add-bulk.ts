import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

type ProblemInput = {
  lc_number: number;
  title: string;
  statement: string;
  example_input: string;
  example_output: string;
  example_explanation: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { problems } = req.body;

  // --------------------
  // Validation
  // --------------------
  if (!Array.isArray(problems) || problems.length === 0) {
    return res.status(400).json({
      error: "Problems must be a non-empty array",
    });
  }

  const invalidIndex = problems.findIndex((p: ProblemInput) => {
    return (
      !p.lc_number ||
      !p.title ||
      !p.statement ||
      !p.example_input ||
      !p.example_output ||
      !p.example_explanation
    );
  });

  if (invalidIndex !== -1) {
    return res.status(400).json({
      error: `Invalid problem at index ${invalidIndex}`,
    });
  }

  // --------------------
  // Insert
  // --------------------
  const { data, error } = await supabase
    .from("problems")
    .insert(problems)
    .select();

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  return res.status(200).json({
    success: true,
    insertedCount: data.length,
    problems: data,
  });
}
