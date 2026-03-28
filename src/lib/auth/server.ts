import type { NextApiRequest, NextApiResponse } from "next";

import {
  getExpiredSessionCookieHeader,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "./session";

type AuthenticatedUser = {
  id: string;
  email: string;
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
