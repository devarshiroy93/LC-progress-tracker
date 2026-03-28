import type { NextApiRequest, NextApiResponse } from "next";

import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, getSessionCookieHeader } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase-admin";

type SigninResponse =
  | { success: true; user: { id: string; email: string; name: string | null } }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SigninResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, name, password_hash")
    .eq("email", email)
    .single();

  if (error || !data || !verifyPassword(password, data.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = await createSessionToken({ id: data.id, email: data.email });
  res.setHeader("Set-Cookie", getSessionCookieHeader(token));

  return res.status(200).json({
    success: true,
    user: {
      id: data.id,
      email: data.email,
      name: data.name,
    },
  });
}
