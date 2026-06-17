import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "./routing";

async function detectLocale(): Promise<Locale> {
  const c = await cookies();
  const cookieValue = c.get(localeCookieName)?.value;
  if (isLocale(cookieValue)) return cookieValue;

  return defaultLocale;
}

type Messages = Record<string, unknown>;

async function loadMessages(locale: Locale): Promise<Messages> {
  const en = (await import("../../messages/en.json")).default as Messages;
  if (locale === "en") return en;

  let active: Messages;
  switch (locale) {
    case "ko":
      active = (await import("../../messages/ko.json")).default as Messages;
      break;
    case "ja":
      active = (await import("../../messages/ja.json")).default as Messages;
      break;
    case "id":
      active = (await import("../../messages/id.json")).default as Messages;
      break;
    default:
      active = en;
  }

  // en을 베이스로 깔고 활성 로케일을 덮어써, 누락 키는 영어로 폴백된다.
  return { ...en, ...active };
}

export default getRequestConfig(async () => {
  const locale = await detectLocale();
  const messages = await loadMessages(locale);
  return {
    locale: locale ?? defaultLocale,
    messages,
  };
});
