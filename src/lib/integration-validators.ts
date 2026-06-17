/**
 * 외부 통합(Linear/Notion 등) API 키 입력의 클라이언트 사전 검증.
 *
 * Linear/Notion 토큰은 영문/숫자/일부 기호로 구성된 ASCII 문자열이다.
 * 한글·이모지·제어문자가 섞이면 백엔드까지 보낼 가치가 없고 fetch 자체가
 * 실패할 수 있으므로 호출 전에 차단한다.
 */

// ASCII printable (0x20~0x7E) 외 문자 검출.
// 토큰에는 보통 줄바꿈/탭이 들어갈 일이 없으므로 제어문자도 거른다.
const NON_PRINTABLE_ASCII = /[^\x20-\x7E]/;
const NON_PRINTABLE_ASCII_GLOBAL = /[^\x20-\x7E]/g;

/**
 * 통합 키 input 의 onChange 단계에서 사용. 비-printable ASCII (한글/이모지/제어문자)를
 * 모두 제거한 문자열을 반환한다. IME 합성 결과로 한글이 한꺼번에 들어오는 경우에도
 * state 에 한글이 절대 저장되지 않도록 가장 안쪽 layer 에서 차단한다.
 */
export function sanitizeIntegrationInput(value: string): string {
  return value.replace(NON_PRINTABLE_ASCII_GLOBAL, "");
}

/**
 * 검증 결과. 메시지는 더 이상 여기서 만들지 않고 안정적인 code 만 반환한다.
 * 실제 사용자 노출 문자열은 consumer 컴포넌트에서 useTranslations("validation.integration")
 * 로 code 를 번역해 만든다.
 */
export interface IntegrationInputCheck {
  ok: boolean;
  /** ok=false 인 경우 번역 키로 쓰일 안정적 code (현재는 nonAscii 만). ok=true 면 null. */
  code: "nonAscii" | null;
  /** 번역 시 {field} 치환에 쓰일 필드 라벨. ok=true 면 빈 문자열. */
  field: string;
}

export function checkIntegrationInput(
  value: string,
  fieldLabel: string,
): IntegrationInputCheck {
  if (NON_PRINTABLE_ASCII.test(value)) {
    return { ok: false, code: "nonAscii", field: fieldLabel };
  }
  return { ok: true, code: null, field: "" };
}

/**
 * Linear API Key + Team ID 입력 검증.
 * 둘 중 하나라도 invalid 면 첫 invalid check 를 그대로 반환.
 */
export function checkLinearInputs(
  apiKey: string,
  teamId: string,
): IntegrationInputCheck {
  const a = checkIntegrationInput(apiKey, "Linear API Key");
  if (!a.ok) return a;
  const t = checkIntegrationInput(teamId, "Linear Team ID");
  if (!t.ok) return t;
  return { ok: true, code: null, field: "" };
}

/**
 * Notion API Key + Database ID 입력 검증.
 */
export function checkNotionInputs(
  apiKey: string,
  databaseId: string,
): IntegrationInputCheck {
  const a = checkIntegrationInput(apiKey, "Notion API Key");
  if (!a.ok) return a;
  const d = checkIntegrationInput(databaseId, "Notion Database ID");
  if (!d.ok) return d;
  return { ok: true, code: null, field: "" };
}

/**
 * fetch 실패를 안정적 code 로 분류한다. 사용자 노출 메시지는 consumer 에서 번역한다.
 * "Failed to fetch" 같은 네트워크 에러는 connectFailed, 그 외는 requestFailed.
 */
export function classifyIntegrationError(
  err: unknown,
): { code: "connectFailed" | "requestFailed"; detail?: string } {
  if (err instanceof Error) {
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      return { code: "connectFailed" };
    }
    return err.message
      ? { code: "requestFailed", detail: err.message }
      : { code: "requestFailed" };
  }
  return { code: "requestFailed" };
}
