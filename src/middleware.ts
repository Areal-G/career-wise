import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { demoAccountForToken } from "@/lib/demo/session";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/pricing",
  "/privacy-policy", // allow public access to privacy policy
  "/terms", // allow public access to terms of service
];

// API routes that don't require authentication
const PUBLIC_API_ROUTES = ["/api/webhooks"];

// Static file extensions to skip
const STATIC_EXTENSIONS = [
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".gif",
  ".webp",
  ".webmanifest",
  ".css",
  ".js",
  ".map",
  ".woff",
  ".woff2",
  ".ttf",
];

function isPublicRoute(pathname: string): boolean {
  // Exact match for public routes
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // Prefix match for public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route)))
    return true;

  // Skip Next.js internals and static files
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;

  // Skip static file extensions
  if (STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))) return true;

  return false;
}

// Portfolio demo build: sessions name one of the in-memory demo accounts.
async function verifySessionToken(token: string): Promise<boolean> {
  return demoAccountForToken(token) !== null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through without auth check
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for the Firebase auth session cookie
  // This cookie is set client-side after successful Firebase Auth login
  const authToken = request.cookies.get("__session")?.value;

  if (!authToken) {
    // No auth token found — redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isValidToken = await verifySessionToken(authToken);
  if (!isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("__session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
