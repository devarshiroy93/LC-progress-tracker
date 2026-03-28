import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

const PUBLIC_PAGES = new Set(["/", "/signin", "/signup", "/articles"]);
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/hello",
  "/api/articles/public",
];

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPage(pathname: string) {
  if (PUBLIC_PAGES.has(pathname)) {
    return true;
  }

  return pathname.startsWith("/articles/");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if ((pathname === "/signin" || pathname === "/signup") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/api")) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
