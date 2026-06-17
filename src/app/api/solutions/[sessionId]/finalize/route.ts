import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/i18n/routing";

// ⚠️ 데모본(clickeye-web-demo): 백엔드 프록시 없이 즉시 mock 프로젝트 id를 반환한다.
// 프로덕션(clickeye-web)에서는 auth() 검증 후 FastAPI /prototype-sessions/{id}/finalize 로 프록시한다.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  // 요청 쿠키에서 로케일을 읽어 응답을 로컬라이즈한다.
  const cookieLocale = req.cookies.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const projectName = {
    en: "Demo Project",
    ko: "데모 프로젝트",
    ja: "デモプロジェクト",
    id: "Proyek Demo",
  }[locale];

  const message = {
    en: "The project has been created.",
    ko: "프로젝트가 생성되었습니다.",
    ja: "プロジェクトが作成されました。",
    id: "Proyek telah dibuat.",
  }[locale];

  return NextResponse.json(
    {
      project_id: "demo-project-0001",
      project_name: projectName,
      session_id: sessionId,
      message,
    },
    { status: 200 },
  );
}
