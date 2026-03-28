import type { NextApiRequest, NextApiResponse } from "next";

import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, getSessionCookieHeader } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase-admin";

type SignupResponse =
  | { success: true; user: { id: string; email: string; name: string | null } }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignupResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  const name = String(req.body.name ?? "").trim();

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const passwordHash = hashPassword(password);

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      name,
      email,
      password_hash: passwordHash,
    })
    .select("id, email, name")
    .single();

  if (error || !data) {
    const message = error?.code === "23505"
      ? "An account with that email already exists"
      : error?.message ?? "Unable to create account";
    return res.status(400).json({ error: message });
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
