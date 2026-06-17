/**
 * 데모용 mock 디스패처 — (HTTP method, path) → 고정 fixture.
 *
 * ⚠️ clickeye-web-demo 전용. 백엔드 없이 위저드 골든패스를 시연하기 위한 계층이다.
 * api-client.ts의 공통 함수 request() 가 이 디스패처로 라우팅한다(실제 fetch 없음).
 * 매핑되지 않은 경로는 console.error 후 throw → 시연 중 누락 경로를 즉시 드러낸다.
 */
import * as fx from "./api-fixtures";

type Handler = (ctx: { body: unknown; match: RegExpMatchArray }) => unknown;
type Route = { method: string; pattern: RegExp; handler: Handler };

// 폴링 상태(세션별 status 조회 횟수). 첫 1회는 generating, 이후 completed.
const pollCounts = new Map<string, number>();

// 사용자가 입력한 값을 이후 조회에 반영하기 위한 경량 캐시.
// ⚠️ 빌더 결과를 캐싱하면 import 시점의 로케일이 고정된다. 대신 입력(body)과 누적 override만
// 저장하고, 매 GET마다 현재 로케일로 다시 빌드한다.
let lastOrgBody: Record<string, unknown> | undefined;
let lastSessionBody: Record<string, unknown> | undefined;
let lastSessionOverrides: Record<string, unknown> = {};

function asRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

const routes: Route[] = [
  // ── 권한 ──
  { method: "GET", pattern: /^\/api\/v1\/rbac\/permissions$/, handler: () => fx.permissions },

  // ── 프로젝트 목록 (로그인 직후 랜딩) ──
  {
    method: "GET",
    pattern: /^\/api\/v1\/projects(?:\?.*)?$/,
    handler: () => fx.projectListEmpty,
  },
  // ── 프로젝트 상세 (위저드 완료 모달의 'Open project page' 대비) ──
  {
    method: "GET",
    pattern: /^\/api\/v1\/integrations\/projects\/[^/]+\/linear-credentials\/status$/,
    handler: () => fx.projectLinearStatus,
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/projects\/[^/]+$/,
    handler: () => fx.demoProject(),
  },

  // ── 조직 ──
  {
    method: "GET",
    pattern: /^\/api\/v1\/organizations\/me$/,
    handler: () => fx.buildOrganization(lastOrgBody),
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/organizations\/?$/,
    handler: ({ body }) => {
      lastOrgBody = asRecord(body);
      return fx.buildOrganization(lastOrgBody);
    },
  },

  // ── 프로토타입 세션 (구체 경로 우선) ──
  {
    method: "GET",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+\/status$/,
    handler: () => {
      const n = (pollCounts.get(fx.DEMO_SESSION_ID) ?? 0) + 1;
      pollCounts.set(fx.DEMO_SESSION_ID, n);
      return fx.sessionStatus(n >= 2 ? "completed" : "generating");
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+\/prototypes$/,
    handler: () => fx.prototypeList(),
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+\/prototypes\/generate$/,
    handler: () => {
      pollCounts.delete(fx.DEMO_SESSION_ID);
      return fx.generateStart();
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+\/recommend-pms$/,
    handler: () => fx.recommendPMs(),
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+\/recommend-components$/,
    handler: () => fx.recommendComponents(),
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+\/finalize$/,
    handler: () => fx.finalizeResponse(),
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/prototype-sessions(?:\?.*)?$/,
    handler: () => [] as unknown[], // 미완료 세션 목록 — 재개 다이얼로그 억제
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/prototype-sessions\/?$/,
    handler: ({ body }) => {
      lastSessionBody = asRecord(body);
      lastSessionOverrides = {};
      return fx.buildSession(lastSessionBody, lastSessionOverrides);
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+$/,
    handler: ({ body }) => {
      // 누적 override만 저장하고, 현재 로케일로 세션을 다시 빌드한다.
      lastSessionOverrides = { ...lastSessionOverrides, ...asRecord(body) };
      return fx.buildSession(lastSessionBody, lastSessionOverrides);
    },
  },
  {
    method: "DELETE",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+$/,
    handler: () => undefined,
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/prototype-sessions\/[^/]+$/,
    handler: () => fx.buildSession(lastSessionBody, lastSessionOverrides),
  },

  // ── PM 프로필 (composition 우선) ──
  {
    method: "GET",
    pattern: /^\/api\/v1\/pm-profiles\/([^/]+)\/composition$/,
    handler: () => fx.pmComposition(),
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/pm-profiles\/[^/]+\/ratings$/,
    handler: ({ body }) => ({
      id: "rating-0001",
      pm_id: "pm-backend-lead",
      user_id: fx.DEMO_USER_ID,
      session_id: fx.DEMO_SESSION_ID,
      rating: Number(asRecord(body).rating ?? 5),
      reaction: (asRecord(body).reaction as string) ?? null,
      comment: (asRecord(body).comment as string) ?? null,
      created_at: "2026-01-02T09:00:00.000Z",
    }),
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/pm-profiles\/?(?:\?.*)?$/,
    handler: () => fx.pmProfileList(),
  },
  {
    method: "GET",
    pattern: /^\/api\/v1\/pm-profiles\/([^/]+)$/,
    handler: ({ match }) => fx.pmProfileWithMetrics(match[1]),
  },

  // ── 카탈로그 ──
  { method: "GET", pattern: /^\/api\/v1\/catalog\/agents$/, handler: () => fx.catalogAgents() },
  { method: "GET", pattern: /^\/api\/v1\/catalog\/skills$/, handler: () => fx.catalogSkills() },
  { method: "GET", pattern: /^\/api\/v1\/catalog\/hooks$/, handler: () => fx.catalogHooks() },
  { method: "GET", pattern: /^\/api\/v1\/catalog\/mcps$/, handler: () => fx.catalogMCPs() },

  // ── 통합 검증 / 등록 ──
  {
    method: "POST",
    pattern: /^\/api\/v1\/integrations\/validate\/(linear|notion)$/,
    handler: () => fx.validateOk(),
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/integrations\/projects\/[^/]+\/initial-tasks$/,
    handler: () => fx.registerInitialTasks,
  },

  // ── ROI ──
  { method: "POST", pattern: /^\/api\/v1\/roi\/calculate$/, handler: () => fx.roiResult() },

  // ── 위저드 프리뷰 (단계별 라이브 프리뷰 — 데모에선 미지원 처리) ──
  {
    method: "POST",
    pattern: /^\/api\/v1\/wizard\/preview$/,
    handler: ({ body }) => fx.wizardPreviewEmpty(String(asRecord(body).step ?? "")),
  },
];

const DELAY_MS = 280; // 실제 호출처럼 보이도록 소폭 지연

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * request()/authRequest()가 호출하는 진입점.
 * @param path  "/api/v1/..." (쿼리 포함 가능)
 * @param method HTTP 메서드
 * @param body  파싱된 요청 본문(JSON) 또는 undefined
 */
export async function mockDispatch<T>(
  path: string,
  method: string,
  body: unknown,
): Promise<T> {
  const pathname = path.split("#")[0];
  const m = method.toUpperCase();

  for (const route of routes) {
    if (route.method !== m) continue;
    const match = pathname.match(route.pattern);
    if (match) {
      await delay(DELAY_MS);
      return route.handler({ body, match }) as T;
    }
  }

  console.error(`[api-mock] Unmapped route: ${m} ${pathname} — fixture/route needs to be added`);
  throw new Error(`[api-mock] Unmapped route: ${m} ${pathname}`);
}
