/**
 * 데모 fixture용 로케일 해석기.
 *
 * fixture 콘텐츠는 호출 시점(call time)에 로케일을 해석해야 한다.
 * 그래야 언어 전환 + 재요청(refetch) 시 번역된 콘텐츠가 보인다.
 * `pick()`은 반드시 함수 본문 안에서 실행되어야 한다(상수에 두면 import 시점에 고정됨).
 */
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/i18n/routing";

/**
 * `clickeye-locale` 쿠키를 읽어 현재 데모 로케일을 반환한다.
 * 클라이언트에서는 `document.cookie`를 파싱한다. document가 없거나(SSR) 쿠키가
 * 없으면 defaultLocale("en")로 폴백한다.
 */
export function getDemoLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${localeCookieName}=`));
  const value = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : undefined;
  return isLocale(value) ? value : defaultLocale;
}

/**
 * 현재 데모 로케일에 해당하는 variant를 선택한다.
 * 호출 시점에 로케일을 해석하므로, 반드시 함수 본문 안에서 호출해야 한다.
 */
export function pick<T>(variants: { en: T; ko: T; ja: T; id: T }): T {
  return variants[getDemoLocale()];
}
