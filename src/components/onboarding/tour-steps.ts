import type { Step } from "react-joyride";

/** next-intl 의 useTranslations("onboarding.tour") 반환 함수 타입 */
type TourTranslator = (key: string) => string;

/**
 * 대시보드 온보딩 투어 스텝 정의 — title/content 는 i18n 메시지에서 가져온다.
 * target/placement 등 구조 정보는 언어와 무관하게 고정.
 */
export function buildTourSteps(t: TourTranslator): Step[] {
  return [
    {
      target: '[data-tour="sidebar-nav"]',
      title: t("steps.navigation.title"),
      content: t("steps.navigation.content"),
      skipBeacon: true,
      placement: "right",
    },
    {
      target: '[data-tour="new-solution-link"]',
      title: t("steps.newSolution.title"),
      content: t("steps.newSolution.content"),
      placement: "right",
    },
    {
      target: '[data-tour="settings-section"]',
      title: t("steps.settings.title"),
      content: t("steps.settings.content"),
      placement: "right",
    },
    {
      target: '[data-tour="projects-link"]',
      title: t("steps.aiTeam.title"),
      content: t("steps.aiTeam.content"),
      placement: "right",
    },
    {
      target: '[data-tour="help-button"]',
      title: t("steps.help.title"),
      content: t("steps.help.content"),
      placement: "bottom",
    },
  ];
}
