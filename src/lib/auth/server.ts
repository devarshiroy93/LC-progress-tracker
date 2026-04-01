import type { NextApiRequest, NextApiResponse } from "next";

import { supabaseAdmin } from "@/lib/supabase-admin";

import {
  getExpiredSessionCookieHeader,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "./session";

type AuthenticatedUser = {
  id: string;
  email: string;
};

type AuthenticatedUserProfile = AuthenticatedUser & {
  name: string;
  role: string;
};

function readCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const match = cookies.find((part) => part.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return match.slice(name.length + 1);
}

export async function getAuthenticatedUser(req: NextApiRequest) {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return null;
  }

  return {
    id: session.sub,
    email: session.email,
  } satisfies AuthenticatedUser;
}

export async function getAuthenticatedUserProfile(req: NextApiRequest) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, name, role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AuthenticatedUserProfile;
}

export async function requireAuthenticatedUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    res.setHeader("Set-Cookie", getExpiredSessionCookieHeader());
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return user;
}

export async function requireAdminUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const profile = await getAuthenticatedUserProfile(req);

  if (!profile) {
    res.setHeader("Set-Cookie", getExpiredSessionCookieHeader());
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (profile.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }

  return profile;
}
