import type { NextApiRequest, NextApiResponse } from "next";

import { getExpiredSessionCookieHeader } from "@/lib/auth/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: true } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Set-Cookie", getExpiredSessionCookieHeader());
  return res.status(200).json({ success: true });
}
