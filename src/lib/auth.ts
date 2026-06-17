import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/i18n/routing";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/**
 * 데모 사용자 표시명을 로케일에 맞게 반환한다.
 * authorize 콜백은 서버 액션/route 컨텍스트에서 실행되므로 next/headers의 cookies()로
 * 요청 쿠키를 읽을 수 있다. 쿠키를 읽을 수 없으면 영어("Demo User")로 폴백한다.
 */
async function demoDisplayName(): Promise<string> {
  let locale: Locale = defaultLocale;
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(localeCookieName)?.value;
    if (isLocale(value)) locale = value;
  } catch {
    // cookies()를 사용할 수 없는 컨텍스트 → 영어 기본값 유지.
  }
  return {
    en: "Demo User",
    ko: "데모 사용자",
    ja: "デモユーザー",
    id: "Pengguna Demo",
  }[locale];
}

/** Access Token 만료 5분 전에 갱신 시도 */
const REFRESH_BUFFER_SECONDS = 5 * 60;

/**
 * Refresh Token으로 새 Access Token을 발급받는다.
 */
async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) return null;

  const tokens: { access_token: string; refresh_token: string } =
    await res.json();
  return tokens;
}

/**
 * 소셜 로그인 후 백엔드에 사용자 등록/조회하고 JWT 토큰을 발급받는다.
 */
async function syncOAuthUser(profile: {
  provider: string;
  oauthId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}) {
  const res = await fetch(`${API_URL}/api/v1/auth/oauth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: profile.provider,
      oauth_id: profile.oauthId,
      email: profile.email,
      display_name: profile.name,
      avatar_url: profile.avatarUrl,
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();

  // 유저 정보 조회
  const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!meRes.ok) return null;

  const user = await meRes.json();

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    plan: user.plan,
    avatarUrl: user.avatar_url,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ⚠️ 데모본(clickeye-web-demo): 백엔드 로그인 없이 고정 데모 사용자를 반환한다.
        // 어떤 이메일/비밀번호를 입력해도 통과한다(빈 값만 거부). 0이 아닌 accessToken을
        // 발급해 위저드의 token 게이트(enabled: !!token)를 통과시킨다.
        // 프로덕션(clickeye-web)에서는 FastAPI /auth/login → /auth/me 로 실제 인증한다.
        if (!credentials?.email || !credentials?.password) return null;
        return {
          id: "demo-user-0001",
          email: String(credentials.email),
          displayName: await demoDisplayName(),
          plan: "pro",
          avatarUrl: null,
          accessToken: "demo-access-token",
          refreshToken: "demo-refresh-token",
        };
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 소셜 로그인: 백엔드에 사용자 동기화
      if (account?.provider === "github" || account?.provider === "google") {
        const oauthId =
          account.provider === "github"
            ? String(profile?.id ?? account.providerAccountId)
            : account.providerAccountId;

        const result = await syncOAuthUser({
          provider: account.provider,
          oauthId,
          email: user.email ?? profile?.email ?? "",
          name:
            user.name ??
            (profile as Record<string, string>)?.login ??
            (await demoDisplayName()),
          avatarUrl: user.image ?? null,
        });

        if (!result) return false;

        // user 객체에 백엔드 토큰 저장 (jwt 콜백에서 사용)
        user.id = result.id;
        user.accessToken = result.accessToken;
        user.refreshToken = result.refreshToken;
        user.displayName = result.displayName;
        user.plan = result.plan;
        user.avatarUrl = result.avatarUrl;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // 초기 로그인: 토큰 정보 저장
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        // ⚠️ 데모본: refresh 백엔드가 없으므로 만료를 먼 미래로 두어 갱신 분기를 타지 않게 한다.
        // (프로덕션은 30분 + REFRESH_BUFFER 로 /auth/refresh 호출)
        token.accessTokenExpires = Date.now() + 365 * 24 * 60 * 60 * 1000;
        token.displayName = user.displayName;
        token.plan = user.plan;
        token.avatarUrl = user.avatarUrl;
        if (account?.provider === "github" || account?.provider === "google") {
          token.sub = user.id;
        }
        return token;
      }

      // 만료 전이면 기존 토큰 반환
      if (Date.now() < token.accessTokenExpires - REFRESH_BUFFER_SECONDS * 1000) {
        return token;
      }

      // 만료 임박 또는 만료됨: Refresh Token으로 갱신
      const refreshed = await refreshAccessToken(token.refreshToken);
      if (refreshed) {
        token.accessToken = refreshed.access_token;
        token.refreshToken = refreshed.refresh_token;
        token.accessTokenExpires = Date.now() + 30 * 60 * 1000;
        token.error = undefined;
      } else {
        // 갱신 실패: 만료 토큰 제거 + 에러 표시 → SessionGuard가 자동 로그아웃
        token.accessToken = "";
        token.error = "RefreshTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.sub ?? "";
      session.user.displayName = token.displayName;
      session.user.plan = token.plan;
      session.user.avatarUrl = token.avatarUrl;
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
