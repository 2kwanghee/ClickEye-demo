# ClickEye 7-Step 위저드 — 백엔드 0 의존 데모

`clickeye-web`의 **7-Step 솔루션 설계 위저드**를 백엔드(API·DB·Redis·API 키) 없이
프론트 단독으로 시연하기 위한 독립 데모본입니다. 모든 API 응답은 고정 mock으로 반환됩니다.

> ⚠️ 이 디렉토리는 시연 전용 스냅샷입니다. 원본 `/mnt/c/workspace/ClickEye/clickeye-web`은
> 일절 수정하지 않았습니다.

## 실행

```bash
cd /mnt/c/workspace/clickeye-web-demo

# (최초 1회) 의존성 설치
npm install

# 방법 A — 프로덕션 모드 (권장, 깔끔한 화면)
npm run build
npm run start          # http://localhost:4001
#  ※ "output: standalone" 경고가 떠도 정상 동작합니다.

# 방법 B — 개발 모드 (핫리로드, 코드 수정하며 시연 조정할 때)
npm run dev            # http://localhost:4001
```

브라우저에서 `http://localhost:4001` 접속 →

1. **로그인**: 아무 이메일/비밀번호나 입력하면 통과합니다 (mock 인증, 백엔드 불필요).
2. 좌측 **New solution** 또는 `/solutions/new` 로 이동.
3. 첫 방문 시 온보딩 투어가 뜨면 **건너뛰기/Skip** 또는 ESC.
4. 회사정보 입력 → 다음 → 위저드를 끝까지 진행하면 **"Solution created!"** 가이드 모달이 표시됩니다.

언어는 우상단 **EN/KO 토글**로 전환할 수 있습니다(EN/KO 모두 정상 동작 확인). 프로토타입/PM/카탈로그
등 시연 데이터는 한국어 고정입니다. 브라우저 기본 언어가 영어면 처음엔 영어로 뜨니, 한국어 시연 전 KO로 토글하세요.

## 시연 시나리오 바꾸기

화면에 나오는 회사/프로토타입/PM/ROI 등 모든 데이터는 **`src/lib/api-fixtures.ts`** 한 파일에 모여 있습니다.
특정 고객 사례로 시연하려면 이 파일의 값(프로토타입 제목·설명, PM 이름·경력, ROI 수치 등)만 바꾸면 됩니다.
(현재 기본값: 데모컴퍼니 / AI 트리아지 헬프데스크 / PM 이서준·박지우·최도현 / 약 71% 절감)

## 시연 범위 경계

- ✅ **위저드 골든패스 전체** + 완료 모달 + **"Open project page"(프로젝트 상세)** 까지 mock으로 동작합니다.
- ⚠️ 프로젝트 상세의 **Dashboard(KPI 차트)·AI Team** 등 더 깊은 탭은 이 데모의 mock 범위 밖입니다
  (위저드 시연이 목적). 해당 탭을 누르면 빈 화면/에러가 보일 수 있으니 시연 동선에서 제외하세요.
- ⚠️ 프로젝트 상세의 **ZIP/ENV 다운로드 버튼**은 실제 백엔드를 호출하므로 데모에선 동작하지 않습니다.

## 골든패스 시연 흐름

회사정보 → AI 프로토타입 생성(로딩 애니메이션) → 프로토타입 선택 → PM 추천/선택/구성 →
에이전트·스킬 선택 → 플랫폼/OS → 환경변수 → ROI 비교 → 최종 확인 → 생성 완료.

데모 데이터(고정): 프로토타입 3종(AI 트리아지 헬프데스크 등), PM 3명(이서준/박지우/최도현),
카탈로그(백엔드/프론트/QA 에이전트, Linear/코드리뷰/테스트 스킬), ROI(약 71% 절감).

## 어떻게 백엔드 없이 동작하나 (이식 시 참고)

프로덕션 대비 **딱 5개 파일만** 데모용으로 바꿨습니다 (나머지 위저드 UI·스토어·스텝은 그대로):

| 파일 | 변경 |
|------|------|
| `src/lib/api-fixtures.ts` (신규) | 골든패스 전 단계의 고정 mock 응답 |
| `src/lib/api-mock.ts` (신규) | `(method, path)→fixture` 디스패처. 미매핑 경로는 콘솔 에러+throw |
| `src/lib/api-client.ts` | 공통 함수 `request()`를 mock 디스패처로 라우팅(실제 fetch 제거). 나머지 export 무변경 |
| `src/app/api/solutions/[sessionId]/finalize/route.ts` | 백엔드 프록시 제거, 즉시 mock 프로젝트 id 반환 |
| `src/lib/auth.ts` | `authorize()` 고정 데모 사용자 + 토큰 만료 무력화 |

`.env.local`은 `AUTH_SECRET`/`AUTH_URL`만 필요합니다(실제 시크릿 아님).

## 검증 (재현 방법)

백엔드를 전혀 켜지 않은 상태에서 위저드를 끝까지 진행하면:
- 브라우저 네트워크 탭에 `localhost:8000`(백엔드) 요청이 **0건**이어야 합니다.
- 콘솔에 `[api-mock] 미매핑 경로` 에러가 없어야 합니다(있으면 해당 경로 fixture 추가 필요).

Playwright 자동 검증 스크립트로 골든패스 완주(finalize 호출) + 위 2조건을 확인했습니다.
