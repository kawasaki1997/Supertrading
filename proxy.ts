import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

// Next.js 16: the old `middleware.ts` convention is now `proxy.ts`.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect every /admin route except the login page itself.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const valid =
      !!process.env.AUTH_TOKEN &&
      request.cookies.get(AUTH_COOKIE)?.value === process.env.AUTH_TOKEN;

    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
