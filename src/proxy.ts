import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  defaultLocale,
  isLocale,
  localeCookieMaxAge,
  localeCookieName,
} from "@/i18n/routing";

export default auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // 쿠키가 없는 신규 방문자는 항상 영어(defaultLocale)로 시작한다.
  const existing = req.cookies.get(localeCookieName)?.value;
  if (!isLocale(existing)) {
    res.cookies.set(localeCookieName, defaultLocale, {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax",
    });
  }

  return res;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
