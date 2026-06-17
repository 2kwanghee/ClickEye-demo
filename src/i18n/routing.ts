export const locales = ["en", "ko", "ja", "id"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// v2: 기존 자동 감지로 설정됐던 `clickeye-locale=ko` 쿠키를 무효화하기 위해 이름을 변경한다.
// 이로써 기존 방문자도 한 번 영어(defaultLocale)로 리셋되어 "무조건 영어 디폴트"가 보장된다.
export const localeCookieName = "clickeye-locale-v2";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    value === "en" || value === "ko" || value === "ja" || value === "id"
  );
}

/**
 * 쿠키가 없는 신규 방문자의 기본 언어를 결정한다.
 * 브라우저 언어와 무관하게 항상 영어(defaultLocale)로 시작한다.
 */
export function pickDefaultLocale(): Locale {
  return defaultLocale;
}
