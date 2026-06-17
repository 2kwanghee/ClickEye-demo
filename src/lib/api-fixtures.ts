/**
 * 데모용 고정 fixture 데이터 — 7-Step 솔루션 설계 위저드 골든패스.
 *
 * ⚠️ 이 디렉토리(clickeye-web-demo)는 백엔드 없이 위저드를 시연하기 위한 독립 데모본이다.
 * 프로덕션(clickeye-web)에는 이 파일이 없다. 모든 응답은 여기 고정값으로 반환되며,
 * 실제 API/DB/AI 호출은 일어나지 않는다.
 *
 * 타입은 api-client에서 type-only import 하므로 런타임 순환참조가 없다.
 *
 * 🌐 로케일: 사용자 노출 콘텐츠는 pick({ en, ko, ja, id })로 감싼다. pick()은 호출 시점에
 * 로케일을 해석하므로, 로컬라이즈된 콘텐츠를 가진 fixture는 반드시 함수로 정의한다
 * (const 객체는 import 시점에 한 번만 평가되어 로케일이 고정되기 때문).
 */
import type {
  OrganizationCreateRequest,
  OrganizationResponse,
  PrototypeSessionCreateRequest,
  PrototypeSessionResponse,
  PrototypeSessionStatusResponse,
  PrototypeListResponse,
  SessionRecommendPMsResponse,
  RecommendComponentsResponse,
  GenerateStartResponse,
  FinalizeResponse,
  PMProfileListResponse,
  PMProfileResponse,
  PMProfileWithMetrics,
  PMCompositionGroupedResponse,
  PMCompositionResponse,
  ProjectListResponse,
  ProjectResponse,
  ProjectLinearStatus,
  CatalogListResponse,
  CatalogAgent,
  CatalogSkill,
  CatalogHook,
  CatalogMCP,
  IntegrationValidateResponse,
  RegisterInitialTasksResponse,
  RoiCalculateResponse,
  WizardPreviewResponse,
  PermissionsResponse,
} from "./api-client";
import { pick } from "./demo-locale";

// ── 공통 상수 ──────────────────────────────────────────────────────────────
export const DEMO_USER_ID = "demo-user-0001";
export const DEMO_ORG_ID = "demo-org-0001";
export const DEMO_SESSION_ID = "demo-session-0001";
export const DEMO_PROJECT_ID = "demo-project-0001";
const TS = "2026-01-02T09:00:00.000Z";

// ── 조직 ────────────────────────────────────────────────────────────────────
export function buildOrganization(
  body?: Partial<OrganizationCreateRequest>,
): OrganizationResponse {
  return {
    id: DEMO_ORG_ID,
    company_name:
      body?.company_name ??
      pick({ en: "Demo Company", ko: "데모컴퍼니", ja: "デモカンパニー", id: "Demo Company" }),
    size:
      body?.size ??
      pick({
        en: "SMB (50–300 employees)",
        ko: "중소기업 (50~300명)",
        ja: "中小企業 (50〜300名)",
        id: "UKM (50–300 karyawan)",
      }),
    industry: body?.industry ?? "SaaS",
    tech_stack: body?.tech_stack ?? ["Next.js", "FastAPI", "PostgreSQL"],
    main_product:
      body?.main_product ??
      pick({
        en: "B2B collaboration solution",
        ko: "B2B 협업 솔루션",
        ja: "B2Bコラボレーションソリューション",
        id: "Solusi kolaborasi B2B",
      }),
    business_type: body?.business_type ?? "b2b",
    company_description:
      body?.company_description ??
      pick({
        en: "A SaaS startup building team collaboration tools",
        ko: "팀 협업 도구를 만드는 SaaS 스타트업",
        ja: "チームコラボレーションツールを開発するSaaSスタートアップ",
        id: "Startup SaaS yang membangun alat kolaborasi tim",
      }),
    created_at: TS,
    updated_at: TS,
  };
}

// ── 프로토타입 세션 ──────────────────────────────────────────────────────────
export function buildSession(
  body?: Partial<PrototypeSessionCreateRequest>,
  overrides?: Partial<PrototypeSessionResponse>,
): PrototypeSessionResponse {
  return {
    id: DEMO_SESSION_ID,
    organization_id: body?.organization_id ?? DEMO_ORG_ID,
    user_id: DEMO_USER_ID,
    solution_prompt:
      body?.solution_prompt ??
      pick({
        en: "An AI helpdesk that auto-classifies customer inquiries and routes them to the right agent",
        ko: "고객 문의를 자동 분류하고 담당자에게 라우팅하는 AI 헬프데스크",
        ja: "顧客の問い合わせを自動分類し、担当者にルーティングするAIヘルプデスク",
        id: "Helpdesk AI yang mengklasifikasikan pertanyaan pelanggan secara otomatis dan merutekannya ke agen yang tepat",
      }),
    parsed_requirements: null,
    status: "pending",
    selected_prototype_id: null,
    selected_pm_id: null,
    current_step: 1,
    created_at: TS,
    updated_at: TS,
    ...overrides,
  };
}

export const sessionStatus = (status: string): PrototypeSessionStatusResponse => ({
  id: DEMO_SESSION_ID,
  status,
  created_at: TS,
});

export const generateStart = (): GenerateStartResponse => ({
  message: pick({
    en: "Prototype generation started.",
    ko: "프로토타입 생성을 시작했습니다.",
    ja: "プロトタイプの生成を開始しました。",
    id: "Pembuatan prototipe dimulai.",
  }),
  session_id: DEMO_SESSION_ID,
});

// ── 프로토타입 3종 ───────────────────────────────────────────────────────────
export const prototypeList = (): PrototypeListResponse => ({
  total: 3,
  items: [
    {
      id: "proto-0001",
      session_id: DEMO_SESSION_ID,
      variant_index: 0,
      title: pick({
        en: "AI Triage Helpdesk",
        ko: "AI 트리아지 헬프데스크",
        ja: "AIトリアージヘルプデスク",
        id: "Helpdesk Triase AI",
      }),
      description: pick({
        en: "A workflow-centric design that uses an LLM to auto-classify and prioritize incoming inquiries, then routes them to the right queue.",
        ko: "수신 문의를 LLM으로 자동 분류·우선순위화하고 담당 큐로 라우팅하는 워크플로 중심 설계.",
        ja: "受信した問い合わせをLLMで自動分類・優先順位付けし、担当キューにルーティングするワークフロー中心の設計。",
        id: "Desain berbasis alur kerja yang menggunakan LLM untuk mengklasifikasikan dan memprioritaskan pertanyaan masuk secara otomatis, lalu merutekannya ke antrean yang tepat.",
      }),
      design_pattern: pick({
        en: "Workflow automation",
        ko: "워크플로 자동화",
        ja: "ワークフロー自動化",
        id: "Otomatisasi alur kerja",
      }),
      menu_structure: null,
      ui_structure: { layout: "inbox-triage" },
      color_palette: null,
      thumbnail_url: null,
      figma_file_key: null,
      figma_embed_url: null,
      status: "ready",
      tech_stack_tags: ["Next.js", "FastAPI", "Celery", "Redis"],
      architecture_pattern: pick({
        en: "Event-driven queue",
        ko: "이벤트 기반 큐",
        ja: "イベント駆動型キュー",
        id: "Antrean berbasis event",
      }),
      variant_rationale: pick({
        en: "Best for environments with high inquiry volume and frequently changing classification rules. Reduces operational load the most.",
        ko: "문의량이 많고 분류 규칙이 자주 바뀌는 환경에 적합. 운영 부하를 가장 크게 줄인다.",
        ja: "問い合わせ量が多く、分類ルールが頻繁に変わる環境に最適。運用負荷を最も大きく削減する。",
        id: "Paling cocok untuk lingkungan dengan volume pertanyaan tinggi dan aturan klasifikasi yang sering berubah. Paling banyak mengurangi beban operasional.",
      }),
      is_recommended: true,
      pros: [
        pick({
          en: "Classification accuracy improves automatically",
          ko: "분류 정확도 자동 개선",
          ja: "分類精度が自動的に向上",
          id: "Akurasi klasifikasi meningkat otomatis",
        }),
        pick({
          en: "Automated agent assignment",
          ko: "담당자 배정 자동화",
          ja: "担当者の割り当てを自動化",
          id: "Penugasan agen otomatis",
        }),
        pick({
          en: "Built-in SLA tracking",
          ko: "SLA 추적 내장",
          ja: "SLAトラッキングを内蔵",
          id: "Pelacakan SLA bawaan",
        }),
      ],
      cons: [
        pick({
          en: "Requires initial training data",
          ko: "초기 학습 데이터 필요",
          ja: "初期の学習データが必要",
          id: "Memerlukan data pelatihan awal",
        }),
        pick({
          en: "Needs misclassification exception handling",
          ko: "오분류 예외 처리 설계 필요",
          ja: "誤分類の例外処理設計が必要",
          id: "Perlu penanganan pengecualian kesalahan klasifikasi",
        }),
      ],
      estimated_weeks_min: 6,
      estimated_weeks_max: 9,
      team_size_min: 2,
      team_size_max: 3,
      team_roles: [
        pick({ en: "Backend", ko: "백엔드", ja: "バックエンド", id: "Backend" }),
        pick({ en: "Frontend", ko: "프론트엔드", ja: "フロントエンド", id: "Frontend" }),
        pick({ en: "ML engineer", ko: "ML 엔지니어", ja: "MLエンジニア", id: "Insinyur ML" }),
      ],
      complexity_score: 6,
      scalability_score: 9,
      monthly_cost_min_usd: 400,
      monthly_cost_max_usd: 900,
      maintenance_difficulty: pick({
        en: "Medium",
        ko: "중간",
        ja: "中",
        id: "Sedang",
      }),
      skill_requirements: [
        pick({
          en: "LLM prompting",
          ko: "LLM 프롬프트",
          ja: "LLMプロンプト",
          id: "Prompt LLM",
        }),
        pick({
          en: "Async queues",
          ko: "비동기 큐",
          ja: "非同期キュー",
          id: "Antrean asinkron",
        }),
        pick({
          en: "Observability",
          ko: "관측성",
          ja: "可観測性",
          id: "Observabilitas",
        }),
      ],
      match_reasoning: pick({
        en: "Maps most directly to the requested 'auto-classify and route' requirement.",
        ko: "요청한 '자동 분류·라우팅' 요구에 가장 직접적으로 부합.",
        ja: "リクエストされた「自動分類・ルーティング」要件に最も直接的に合致。",
        id: "Paling langsung sesuai dengan kebutuhan 'klasifikasi dan rute otomatis' yang diminta.",
      }),
      created_at: TS,
      updated_at: TS,
    },
    {
      id: "proto-0002",
      session_id: DEMO_SESSION_ID,
      variant_index: 1,
      title: pick({
        en: "Unified Omnichannel Console",
        ko: "통합 옴니채널 콘솔",
        ja: "統合オムニチャネルコンソール",
        id: "Konsol Omnichannel Terpadu",
      }),
      description: pick({
        en: "A design that unifies email, chat, and phone inquiries into a single dashboard, focused on agent collaboration.",
        ko: "이메일·채팅·전화 문의를 단일 대시보드로 통합하고 상담원 협업에 초점을 둔 설계.",
        ja: "メール・チャット・電話の問い合わせを単一のダッシュボードに統合し、エージェントの協業に焦点を当てた設計。",
        id: "Desain yang menyatukan pertanyaan email, chat, dan telepon ke dalam satu dasbor, dengan fokus pada kolaborasi agen.",
      }),
      design_pattern: pick({
        en: "Unified dashboard",
        ko: "통합 대시보드",
        ja: "統合ダッシュボード",
        id: "Dasbor terpadu",
      }),
      menu_structure: null,
      ui_structure: { layout: "omnichannel-console" },
      color_palette: null,
      thumbnail_url: null,
      figma_file_key: null,
      figma_embed_url: null,
      status: "ready",
      tech_stack_tags: ["Next.js", "FastAPI", "WebSocket"],
      architecture_pattern: pick({
        en: "Real-time gateway",
        ko: "실시간 게이트웨이",
        ja: "リアルタイムゲートウェイ",
        id: "Gateway real-time",
      }),
      variant_rationale: pick({
        en: "Best for organizations with diverse channels where agent collaboration matters. AI plays a supporting recommendation role.",
        ko: "채널이 다양하고 상담원 협업이 중요한 조직에 적합. AI는 보조 추천 역할.",
        ja: "チャネルが多様でエージェントの協業が重要な組織に最適。AIは補助的な推薦の役割。",
        id: "Paling cocok untuk organisasi dengan beragam saluran di mana kolaborasi agen penting. AI berperan sebagai rekomendasi pendukung.",
      }),
      is_recommended: false,
      pros: [
        pick({
          en: "Unified channel management",
          ko: "채널 통합 관리",
          ja: "チャネルの統合管理",
          id: "Manajemen saluran terpadu",
        }),
        pick({
          en: "Real-time agent collaboration",
          ko: "상담원 실시간 협업",
          ja: "エージェントのリアルタイム協業",
          id: "Kolaborasi agen real-time",
        }),
        pick({
          en: "Highly intuitive to adopt",
          ko: "도입 직관성 높음",
          ja: "導入の直感性が高い",
          id: "Sangat intuitif untuk diadopsi",
        }),
      ],
      cons: [
        pick({
          en: "Low share of automation",
          ko: "자동화 비중 낮음",
          ja: "自動化の比重が低い",
          id: "Porsi otomatisasi rendah",
        }),
        pick({
          en: "Maintenance burden of channel integrations",
          ko: "채널 연동 유지보수 부담",
          ja: "チャネル連携の保守負担",
          id: "Beban pemeliharaan integrasi saluran",
        }),
      ],
      estimated_weeks_min: 8,
      estimated_weeks_max: 12,
      team_size_min: 3,
      team_size_max: 4,
      team_roles: [
        pick({ en: "Backend", ko: "백엔드", ja: "バックエンド", id: "Backend" }),
        pick({ en: "Frontend", ko: "프론트엔드", ja: "フロントエンド", id: "Frontend" }),
        pick({ en: "QA", ko: "QA", ja: "QA", id: "QA" }),
      ],
      complexity_score: 7,
      scalability_score: 7,
      monthly_cost_min_usd: 500,
      monthly_cost_max_usd: 1100,
      maintenance_difficulty: pick({
        en: "Medium-high",
        ko: "중상",
        ja: "中〜高",
        id: "Sedang-tinggi",
      }),
      skill_requirements: [
        pick({
          en: "Real-time communication",
          ko: "실시간 통신",
          ja: "リアルタイム通信",
          id: "Komunikasi real-time",
        }),
        pick({
          en: "Channel API integration",
          ko: "채널 API 연동",
          ja: "チャネルAPI連携",
          id: "Integrasi API saluran",
        }),
      ],
      match_reasoning: pick({
        en: "Strong on unification, but only indirectly related to the auto-classification requirement.",
        ko: "통합 관점 강점이나 자동 분류 요구와는 간접적.",
        ja: "統合の観点では強みがあるが、自動分類の要件とは間接的。",
        id: "Kuat dalam unifikasi, tetapi hanya terkait secara tidak langsung dengan kebutuhan klasifikasi otomatis.",
      }),
      created_at: TS,
      updated_at: TS,
    },
    {
      id: "proto-0003",
      session_id: DEMO_SESSION_ID,
      variant_index: 2,
      title: pick({
        en: "Self-Service Knowledge Base Bot",
        ko: "셀프서비스 지식베이스 봇",
        ja: "セルフサービスナレッジベースボット",
        id: "Bot Basis Pengetahuan Swalayan",
      }),
      description: pick({
        en: "A deflection design that uses RAG-based auto-responses to reduce first-line inquiries, passing only unresolved cases to agents.",
        ko: "RAG 기반 자동 응답으로 1차 문의를 줄이고 미해결만 상담원에게 넘기는 디플렉션 설계.",
        ja: "RAGベースの自動応答で一次問い合わせを減らし、未解決のものだけをエージェントに引き継ぐディフレクション設計。",
        id: "Desain defleksi yang menggunakan respons otomatis berbasis RAG untuk mengurangi pertanyaan lini pertama, hanya meneruskan kasus yang belum terselesaikan ke agen.",
      }),
      design_pattern: pick({
        en: "RAG assistant",
        ko: "RAG 어시스턴트",
        ja: "RAGアシスタント",
        id: "Asisten RAG",
      }),
      menu_structure: null,
      ui_structure: { layout: "kb-deflection" },
      color_palette: null,
      thumbnail_url: null,
      figma_file_key: null,
      figma_embed_url: null,
      status: "ready",
      tech_stack_tags: ["Next.js", "FastAPI", "pgvector"],
      architecture_pattern: pick({
        en: "RAG pipeline",
        ko: "RAG 파이프라인",
        ja: "RAGパイプライン",
        id: "Pipeline RAG",
      }),
      variant_rationale: pick({
        en: "Reduces the inflow itself when repetitive inquiries are common. Success hinges on content quality.",
        ko: "반복 문의 비중이 높을 때 인입 자체를 줄인다. 콘텐츠 품질에 성패가 갈림.",
        ja: "繰り返しの問い合わせが多い場合に流入そのものを減らす。コンテンツの品質が成否を分ける。",
        id: "Mengurangi arus masuk itu sendiri ketika pertanyaan berulang umum terjadi. Keberhasilan bergantung pada kualitas konten.",
      }),
      is_recommended: false,
      pros: [
        pick({
          en: "Reduces inquiry volume itself",
          ko: "문의량 자체 감소",
          ja: "問い合わせ量自体を削減",
          id: "Mengurangi volume pertanyaan itu sendiri",
        }),
        pick({
          en: "24/7 instant responses",
          ko: "24/7 즉시 응답",
          ja: "24時間365日の即時応答",
          id: "Respons instan 24/7",
        }),
        pick({
          en: "Lower operational labor costs",
          ko: "운영 인건비 절감",
          ja: "運用人件費の削減",
          id: "Biaya tenaga kerja operasional lebih rendah",
        }),
      ],
      cons: [
        pick({
          en: "Requires knowledge base maintenance",
          ko: "지식베이스 정비 필요",
          ja: "ナレッジベースの整備が必要",
          id: "Memerlukan pemeliharaan basis pengetahuan",
        }),
        pick({
          en: "Hallucination prevention is essential",
          ko: "환각 방지 설계 필수",
          ja: "ハルシネーション防止の設計が必須",
          id: "Pencegahan halusinasi sangat penting",
        }),
      ],
      estimated_weeks_min: 5,
      estimated_weeks_max: 8,
      team_size_min: 2,
      team_size_max: 3,
      team_roles: [
        pick({ en: "Backend", ko: "백엔드", ja: "バックエンド", id: "Backend" }),
        pick({ en: "ML engineer", ko: "ML 엔지니어", ja: "MLエンジニア", id: "Insinyur ML" }),
      ],
      complexity_score: 6,
      scalability_score: 8,
      monthly_cost_min_usd: 350,
      monthly_cost_max_usd: 800,
      maintenance_difficulty: pick({
        en: "Medium",
        ko: "중간",
        ja: "中",
        id: "Sedang",
      }),
      skill_requirements: [
        pick({ en: "RAG", ko: "RAG", ja: "RAG", id: "RAG" }),
        pick({ en: "Embeddings", ko: "임베딩", ja: "埋め込み", id: "Embedding" }),
        pick({
          en: "Content operations",
          ko: "콘텐츠 운영",
          ja: "コンテンツ運用",
          id: "Operasi konten",
        }),
      ],
      match_reasoning: pick({
        en: "Big deflection impact, but focused on 'responding' rather than 'routing'.",
        ko: "디플렉션 효과는 크나 '라우팅'보다 '응답'에 초점.",
        ja: "ディフレクション効果は大きいが、「ルーティング」より「応答」に焦点。",
        id: "Dampak defleksi besar, tetapi berfokus pada 'merespons' alih-alih 'merutekan'.",
      }),
      created_at: TS,
      updated_at: TS,
    },
  ],
});

// ── 컴포넌트 추천 (Step 직후 자동) ───────────────────────────────────────────
export const recommendComponents = (): RecommendComponentsResponse => ({
  agents: ["backend", "frontend", "qa"],
  skills: ["linear", "code-review", "testing"],
  excluded_agents: ["security"],
  catalog_entry_slug: "ai-helpdesk",
  reasoning: pick({
    en: "The selected prototype is workflow-automation centric, so we recommend the backend, frontend, and QA agents along with issue tracking (Linear), code review, and testing skills.",
    ko: "선택한 프로토타입은 워크플로 자동화 중심이라 백엔드·프론트·QA 에이전트와 이슈 추적(Linear)·코드리뷰·테스트 스킬을 권장합니다.",
    ja: "選択したプロトタイプはワークフロー自動化が中心のため、バックエンド・フロントエンド・QAエージェントと、課題追跡(Linear)・コードレビュー・テストのスキルを推奨します。",
    id: "Prototipe yang dipilih berpusat pada otomatisasi alur kerja, jadi kami merekomendasikan agen backend, frontend, dan QA beserta keterampilan pelacakan isu (Linear), tinjauan kode, dan pengujian.",
  }),
});

// ── PM 추천 (세션 기반) ──────────────────────────────────────────────────────
export const recommendPMs = (): SessionRecommendPMsResponse => {
  const dimTech = pick({
    en: "Technical fit",
    ko: "기술적합도",
    ja: "技術適合度",
    id: "Kecocokan teknis",
  });
  const dimDomain = pick({
    en: "Domain experience",
    ko: "도메인경험",
    ja: "ドメイン経験",
    id: "Pengalaman domain",
  });
  const dimCollab = pick({
    en: "Collaboration",
    ko: "협업",
    ja: "協業",
    id: "Kolaborasi",
  });
  return {
    items: [
      {
        pm_id: "pm-backend-lead",
        name: pick({ en: "Seojun Lee", ko: "이서준", ja: "イ・ソジュン", id: "Seojun Lee" }),
        slug: "pm-backend-lead",
        avatar_url: null,
        title: pick({
          en: "Backend Automation Lead",
          ko: "백엔드 자동화 리드",
          ja: "バックエンド自動化リード",
          id: "Lead Otomatisasi Backend",
        }),
        domain: pick({
          en: "Backend/Infrastructure",
          ko: "백엔드/인프라",
          ja: "バックエンド/インフラ",
          id: "Backend/Infrastruktur",
        }),
        match_score: 0.94,
        reasoning: pick({
          en: "Has extensive experience with event-driven queues and LLM classification pipelines, the best fit for the recommended prototype.",
          ko: "이벤트 기반 큐와 LLM 분류 파이프라인 경험이 많아 추천 프로토타입과 가장 잘 맞습니다.",
          ja: "イベント駆動型キューとLLM分類パイプラインの経験が豊富で、推奨プロトタイプに最も適しています。",
          id: "Memiliki pengalaman luas dengan antrean berbasis event dan pipeline klasifikasi LLM, paling cocok untuk prototipe yang direkomendasikan.",
        }),
        dimension_scores: { [dimTech]: 0.95, [dimDomain]: 0.93, [dimCollab]: 0.9 },
        match_reasons: [
          pick({
            en: "Async queue design experience",
            ko: "비동기 큐 설계 경험",
            ja: "非同期キュー設計の経験",
            id: "Pengalaman merancang antrean asinkron",
          }),
          pick({
            en: "LLM operations experience",
            ko: "LLM 운영 경험",
            ja: "LLM運用の経験",
            id: "Pengalaman operasi LLM",
          }),
          pick({
            en: "SLA tracking implementation",
            ko: "SLA 추적 구현",
            ja: "SLAトラッキングの実装",
            id: "Implementasi pelacakan SLA",
          }),
        ],
      },
      {
        pm_id: "pm-product",
        name: pick({ en: "Jiwoo Park", ko: "박지우", ja: "パク・ジウ", id: "Jiwoo Park" }),
        slug: "pm-product",
        avatar_url: null,
        title: pick({
          en: "Product PM",
          ko: "프로덕트 PM",
          ja: "プロダクトPM",
          id: "PM Produk",
        }),
        domain: pick({ en: "Product", ko: "프로덕트", ja: "プロダクト", id: "Produk" }),
        match_score: 0.86,
        reasoning: pick({
          en: "Strong at user experience and operational flow design.",
          ko: "사용자 경험과 운영 흐름 설계에 강점이 있습니다.",
          ja: "ユーザー体験と運用フローの設計に強みがあります。",
          id: "Kuat dalam pengalaman pengguna dan desain alur operasional.",
        }),
        dimension_scores: { [dimTech]: 0.8, [dimDomain]: 0.88, [dimCollab]: 0.92 },
        match_reasons: [
          pick({
            en: "Support flow design",
            ko: "상담 흐름 설계",
            ja: "サポートフロー設計",
            id: "Desain alur dukungan",
          }),
          pick({
            en: "Metric definition",
            ko: "지표 정의",
            ja: "指標の定義",
            id: "Definisi metrik",
          }),
        ],
      },
      {
        pm_id: "pm-platform",
        name: pick({ en: "Dohyun Choi", ko: "최도현", ja: "チェ・ドヒョン", id: "Dohyun Choi" }),
        slug: "pm-platform",
        avatar_url: null,
        title: pick({
          en: "Platform Architect",
          ko: "플랫폼 아키텍트",
          ja: "プラットフォームアーキテクト",
          id: "Arsitek Platform",
        }),
        domain: pick({ en: "Platform", ko: "플랫폼", ja: "プラットフォーム", id: "Platform" }),
        match_score: 0.81,
        reasoning: pick({
          en: "Strong at scalability and multichannel integration design.",
          ko: "확장성과 멀티채널 통합 설계에 강점이 있습니다.",
          ja: "拡張性とマルチチャネル統合の設計に強みがあります。",
          id: "Kuat dalam skalabilitas dan desain integrasi multikanal.",
        }),
        dimension_scores: { [dimTech]: 0.88, [dimDomain]: 0.78, [dimCollab]: 0.8 },
        match_reasons: [
          pick({
            en: "Large-scale traffic experience",
            ko: "대규모 트래픽 경험",
            ja: "大規模トラフィックの経験",
            id: "Pengalaman trafik skala besar",
          }),
          pick({
            en: "Channel integration design",
            ko: "채널 통합 설계",
            ja: "チャネル統合の設計",
            id: "Desain integrasi saluran",
          }),
        ],
      },
    ],
  };
};

// ── PM 프로필 ────────────────────────────────────────────────────────────────
function basePM(over: Partial<PMProfileResponse> & { id: string; name: string; slug: string }): PMProfileResponse {
  return {
    avatar_url: null,
    title: null,
    description: null,
    domain: null,
    specialties: [],
    personality: {},
    is_active: true,
    created_at: TS,
    bio_long: null,
    years_experience: null,
    preferred_solution_types: [],
    tech_stack_tags: [],
    industry_tags: [],
    language: "ko",
    updated_at: TS,
    supported_platforms: ["claude-code", "gemini-cli", "cursor"],
    name_en: null,
    title_en: null,
    description_en: null,
    bio_long_en: null,
    ...over,
  };
}

// PM_PROFILES는 로컬라이즈된 콘텐츠를 포함하므로 함수로 정의(호출 시점에 로케일 해석).
function pmProfiles(): Record<string, PMProfileResponse> {
  return {
    "pm-backend-lead": basePM({
      id: "pm-backend-lead",
      name: pick({ en: "Seojun Lee", ko: "이서준", ja: "イ・ソジュン", id: "Seojun Lee" }),
      slug: "pm-backend-lead",
      title: pick({
        en: "Backend Automation Lead",
        ko: "백엔드 자동화 리드",
        ja: "バックエンド自動化リード",
        id: "Lead Otomatisasi Backend",
      }),
      description: pick({
        en: "Specialist in event-driven backends and LLM operations pipelines",
        ko: "이벤트 기반 백엔드와 LLM 운영 파이프라인 전문",
        ja: "イベント駆動型バックエンドとLLM運用パイプラインの専門家",
        id: "Spesialis backend berbasis event dan pipeline operasi LLM",
      }),
      domain: pick({
        en: "Backend/Infrastructure",
        ko: "백엔드/인프라",
        ja: "バックエンド/インフラ",
        id: "Backend/Infrastruktur",
      }),
      specialties: [
        pick({ en: "Async queues", ko: "비동기 큐", ja: "非同期キュー", id: "Antrean asinkron" }),
        pick({ en: "LLM operations", ko: "LLM 운영", ja: "LLM運用", id: "Operasi LLM" }),
        pick({ en: "Observability", ko: "관측성", ja: "可観測性", id: "Observabilitas" }),
      ],
      bio_long: pick({
        en: "Has built numerous large-scale message processing systems and LLM-based classification pipelines.",
        ko: "대규모 메시지 처리 시스템과 LLM 기반 분류 파이프라인을 다수 구축했습니다.",
        ja: "大規模なメッセージ処理システムとLLMベースの分類パイプラインを数多く構築してきました。",
        id: "Telah membangun banyak sistem pemrosesan pesan skala besar dan pipeline klasifikasi berbasis LLM.",
      }),
      years_experience: 9,
      preferred_solution_types: [
        pick({
          en: "Workflow automation",
          ko: "워크플로 자동화",
          ja: "ワークフロー自動化",
          id: "Otomatisasi alur kerja",
        }),
        pick({ en: "RAG assistant", ko: "RAG 어시스턴트", ja: "RAGアシスタント", id: "Asisten RAG" }),
      ],
      tech_stack_tags: ["FastAPI", "Celery", "Redis", "PostgreSQL"],
      industry_tags: ["SaaS", "B2B"],
    }),
    "pm-product": basePM({
      id: "pm-product",
      name: pick({ en: "Jiwoo Park", ko: "박지우", ja: "パク・ジウ", id: "Jiwoo Park" }),
      slug: "pm-product",
      title: pick({ en: "Product PM", ko: "프로덕트 PM", ja: "プロダクトPM", id: "PM Produk" }),
      description: pick({
        en: "Specialist in user experience and operational flow design",
        ko: "사용자 경험과 운영 흐름 설계 전문",
        ja: "ユーザー体験と運用フロー設計の専門家",
        id: "Spesialis pengalaman pengguna dan desain alur operasional",
      }),
      domain: pick({ en: "Product", ko: "프로덕트", ja: "プロダクト", id: "Produk" }),
      specialties: [
        pick({ en: "UX design", ko: "UX 설계", ja: "UX設計", id: "Desain UX" }),
        pick({ en: "Metric definition", ko: "지표 정의", ja: "指標の定義", id: "Definisi metrik" }),
        pick({ en: "Roadmap", ko: "로드맵", ja: "ロードマップ", id: "Roadmap" }),
      ],
      bio_long: pick({
        en: "Has experienced both the 0→1 and growth stages of B2B SaaS products.",
        ko: "B2B SaaS 프로덕트의 0→1 및 성장 단계를 두루 경험했습니다.",
        ja: "B2B SaaSプロダクトの0→1から成長段階まで幅広く経験してきました。",
        id: "Telah mengalami tahap 0→1 dan pertumbuhan produk SaaS B2B.",
      }),
      years_experience: 7,
      preferred_solution_types: [
        pick({
          en: "Unified dashboard",
          ko: "통합 대시보드",
          ja: "統合ダッシュボード",
          id: "Dasbor terpadu",
        }),
      ],
      tech_stack_tags: ["Next.js", "Figma"],
      industry_tags: ["SaaS"],
    }),
    "pm-platform": basePM({
      id: "pm-platform",
      name: pick({ en: "Dohyun Choi", ko: "최도현", ja: "チェ・ドヒョン", id: "Dohyun Choi" }),
      slug: "pm-platform",
      title: pick({
        en: "Platform Architect",
        ko: "플랫폼 아키텍트",
        ja: "プラットフォームアーキテクト",
        id: "Arsitek Platform",
      }),
      description: pick({
        en: "Specialist in scalability and multichannel integration design",
        ko: "확장성과 멀티채널 통합 설계 전문",
        ja: "拡張性とマルチチャネル統合設計の専門家",
        id: "Spesialis skalabilitas dan desain integrasi multikanal",
      }),
      domain: pick({ en: "Platform", ko: "플랫폼", ja: "プラットフォーム", id: "Platform" }),
      specialties: [
        pick({
          en: "Distributed systems",
          ko: "분산 시스템",
          ja: "分散システム",
          id: "Sistem terdistribusi",
        }),
        pick({
          en: "Channel integration",
          ko: "채널 통합",
          ja: "チャネル統合",
          id: "Integrasi saluran",
        }),
        pick({ en: "Scalability", ko: "확장성", ja: "拡張性", id: "Skalabilitas" }),
      ],
      bio_long: pick({
        en: "Has designed large-scale traffic platforms and omnichannel gateways.",
        ko: "대규모 트래픽 플랫폼과 옴니채널 게이트웨이를 설계해왔습니다.",
        ja: "大規模トラフィックのプラットフォームとオムニチャネルゲートウェイを設計してきました。",
        id: "Telah merancang platform trafik skala besar dan gateway omnichannel.",
      }),
      years_experience: 11,
      preferred_solution_types: [
        pick({
          en: "Unified dashboard",
          ko: "통합 대시보드",
          ja: "統合ダッシュボード",
          id: "Dasbor terpadu",
        }),
        pick({
          en: "Workflow automation",
          ko: "워크플로 자동화",
          ja: "ワークフロー自動化",
          id: "Otomatisasi alur kerja",
        }),
      ],
      tech_stack_tags: ["FastAPI", "WebSocket", "Kafka"],
      industry_tags: ["SaaS", "Enterprise"],
    }),
  };
}

export const pmProfileList = (): PMProfileListResponse => {
  const profiles = pmProfiles();
  return {
    items: Object.values(profiles),
    total: Object.keys(profiles).length,
  };
};

export function pmProfileWithMetrics(id: string): PMProfileWithMetrics {
  const profiles = pmProfiles();
  const base = profiles[id] ?? profiles["pm-backend-lead"];
  return {
    ...base,
    usage_count: 128,
    completed_projects: 96,
    avg_rating: 4.7,
    total_ratings: 84,
    like_count: 79,
    dislike_count: 5,
    success_rate: 0.92,
    avg_completion_days: 47,
  };
}

function comp(
  slug: string,
  name: string,
  type: string,
  order: number,
): PMCompositionResponse {
  return {
    id: `comp-${type}-${slug}`,
    pm_id: "pm-backend-lead",
    component_type: type,
    component_slug: slug,
    component_name: name,
    config: {},
    display_order: order,
    is_required: type === "agent",
  };
}

export const pmComposition = (): PMCompositionGroupedResponse => ({
  agents: [
    comp(
      "backend",
      pick({ en: "Backend agent", ko: "백엔드 에이전트", ja: "バックエンドエージェント", id: "Agen backend" }),
      "agent",
      0,
    ),
    comp(
      "frontend",
      pick({ en: "Frontend agent", ko: "프론트엔드 에이전트", ja: "フロントエンドエージェント", id: "Agen frontend" }),
      "agent",
      1,
    ),
    comp(
      "qa",
      pick({ en: "QA agent", ko: "QA 에이전트", ja: "QAエージェント", id: "Agen QA" }),
      "agent",
      2,
    ),
  ],
  skills: [
    comp(
      "linear",
      pick({ en: "Linear issue tracking", ko: "Linear 이슈 추적", ja: "Linear課題追跡", id: "Pelacakan isu Linear" }),
      "skill",
      0,
    ),
    comp(
      "code-review",
      pick({ en: "Code review", ko: "코드 리뷰", ja: "コードレビュー", id: "Tinjauan kode" }),
      "skill",
      1,
    ),
    comp(
      "testing",
      pick({ en: "Test automation", ko: "테스트 자동화", ja: "テスト自動化", id: "Otomatisasi pengujian" }),
      "skill",
      2,
    ),
  ],
  hooks: [
    comp(
      "pre-commit-gate",
      pick({ en: "Commit gate", ko: "커밋 게이트", ja: "コミットゲート", id: "Gerbang commit" }),
      "hook",
      0,
    ),
  ],
  mcp_servers: [],
  plugins: [],
});

// ── 카탈로그 ──────────────────────────────────────────────────────────────────
export const catalogAgents = (): CatalogListResponse<CatalogAgent> => ({
  total: 5,
  items: [
    {
      id: "backend",
      label: pick({ en: "Backend", ko: "백엔드", ja: "バックエンド", id: "Backend" }),
      description: pick({
        en: "Implements APIs, servers, and data models",
        ko: "API·서버·데이터 모델 구현",
        ja: "API・サーバー・データモデルの実装",
        id: "Mengimplementasikan API, server, dan model data",
      }),
    },
    {
      id: "frontend",
      label: pick({ en: "Frontend", ko: "프론트엔드", ja: "フロントエンド", id: "Frontend" }),
      description: pick({
        en: "Implements UI/UX and screens",
        ko: "UI/UX 및 화면 구현",
        ja: "UI/UXと画面の実装",
        id: "Mengimplementasikan UI/UX dan tampilan",
      }),
    },
    {
      id: "qa",
      label: pick({ en: "QA", ko: "QA", ja: "QA", id: "QA" }),
      description: pick({
        en: "Test automation and quality gates",
        ko: "테스트 자동화 및 품질 게이트",
        ja: "テスト自動化と品質ゲート",
        id: "Otomatisasi pengujian dan gerbang kualitas",
      }),
    },
    {
      id: "devops",
      label: pick({ en: "DevOps", ko: "DevOps", ja: "DevOps", id: "DevOps" }),
      description: pick({
        en: "Infrastructure and deployment automation",
        ko: "인프라·배포 자동화",
        ja: "インフラ・デプロイの自動化",
        id: "Otomatisasi infrastruktur dan deployment",
      }),
    },
    {
      id: "security",
      label: pick({ en: "Security", ko: "Security", ja: "Security", id: "Security" }),
      description: pick({
        en: "Security checks and audits",
        ko: "보안 점검 및 감사",
        ja: "セキュリティ点検と監査",
        id: "Pemeriksaan dan audit keamanan",
      }),
    },
  ],
});

export const catalogSkills = (): CatalogListResponse<CatalogSkill> => ({
  total: 5,
  items: [
    {
      id: "linear",
      label: pick({ en: "Linear issue tracking", ko: "Linear 이슈 추적", ja: "Linear課題追跡", id: "Pelacakan isu Linear" }),
      description: pick({
        en: "Auto-creates and syncs issues to Linear",
        ko: "Linear에 이슈를 자동 생성·동기화",
        ja: "Linearに課題を自動作成・同期",
        id: "Membuat dan menyinkronkan isu ke Linear secara otomatis",
      }),
      category: "ticket_source",
      required: false,
      env_vars: [
        {
          name: "LINEAR_API_KEY",
          required: true,
          description: pick({
            en: "Linear API key",
            ko: "Linear API 키",
            ja: "Linear APIキー",
            id: "Kunci API Linear",
          }),
        },
        {
          name: "LINEAR_TEAM_ID",
          required: true,
          description: pick({
            en: "Linear team ID",
            ko: "Linear 팀 ID",
            ja: "LinearチームID",
            id: "ID tim Linear",
          }),
        },
      ],
      hook_events: [],
      body_md: null,
    },
    {
      id: "notion",
      label: pick({ en: "Notion integration", ko: "Notion 연동", ja: "Notion連携", id: "Integrasi Notion" }),
      description: pick({
        en: "Syncs task records to a Notion database",
        ko: "Notion DB에 작업 기록을 동기화",
        ja: "Notion DBに作業記録を同期",
        id: "Menyinkronkan catatan tugas ke database Notion",
      }),
      category: "ticket_source",
      required: false,
      env_vars: [
        {
          name: "NOTION_API_KEY",
          required: true,
          description: pick({
            en: "Notion API key",
            ko: "Notion API 키",
            ja: "Notion APIキー",
            id: "Kunci API Notion",
          }),
        },
        {
          name: "NOTION_DATABASE_ID",
          required: true,
          description: pick({
            en: "Notion DB ID",
            ko: "Notion DB ID",
            ja: "Notion DB ID",
            id: "ID DB Notion",
          }),
        },
      ],
      hook_events: [],
      body_md: null,
    },
    {
      id: "code-review",
      label: pick({ en: "Code review", ko: "코드 리뷰", ja: "コードレビュー", id: "Tinjauan kode" }),
      description: pick({
        en: "Automated PR code review",
        ko: "PR 자동 코드 리뷰",
        ja: "PRの自動コードレビュー",
        id: "Tinjauan kode PR otomatis",
      }),
      category: "quality",
      required: false,
      env_vars: [],
      hook_events: ["PreToolUse"],
      body_md: null,
    },
    {
      id: "testing",
      label: pick({ en: "Test automation", ko: "테스트 자동화", ja: "テスト自動化", id: "Otomatisasi pengujian" }),
      description: pick({
        en: "Generates and runs unit/integration tests",
        ko: "유닛/통합 테스트 생성 및 실행",
        ja: "ユニット/統合テストの生成と実行",
        id: "Membuat dan menjalankan tes unit/integrasi",
      }),
      category: "quality",
      required: false,
      env_vars: [],
      hook_events: [],
      body_md: null,
    },
    {
      id: "telegram",
      label: pick({ en: "Telegram notifications", ko: "Telegram 알림", ja: "Telegram通知", id: "Notifikasi Telegram" }),
      description: pick({
        en: "Sends a Telegram notification when a task completes",
        ko: "작업 완료 시 Telegram 알림",
        ja: "作業完了時にTelegram通知",
        id: "Mengirim notifikasi Telegram saat tugas selesai",
      }),
      category: "notification",
      required: false,
      env_vars: [
        { name: "TELEGRAM_BOT_TOKEN", required: false },
        { name: "TELEGRAM_CHAT_ID", required: false },
      ],
      hook_events: [],
      body_md: null,
    },
  ],
});

export const catalogHooks = (): CatalogListResponse<CatalogHook> => ({
  total: 2,
  items: [
    {
      id: "pre-commit-gate",
      label: pick({ en: "Commit gate", ko: "커밋 게이트", ja: "コミットゲート", id: "Gerbang commit" }),
      description: pick({
        en: "Enforces lint/typecheck/test before commit",
        ko: "커밋 전 lint/typecheck/test 강제",
        ja: "コミット前にlint/typecheck/testを強制",
        id: "Menerapkan lint/typecheck/test sebelum commit",
      }),
      category: "quality",
      event: "PreToolUse",
      required: false,
    },
    {
      id: "session-logger",
      label: pick({ en: "Session logger", ko: "세션 로거", ja: "セッションロガー", id: "Logger sesi" }),
      description: pick({
        en: "Records the work log when a session ends",
        ko: "세션 종료 시 작업 내역 기록",
        ja: "セッション終了時に作業内容を記録",
        id: "Mencatat log pekerjaan saat sesi berakhir",
      }),
      category: "observability",
      event: "Stop",
      required: false,
    },
  ],
});

export const catalogMCPs = (): CatalogListResponse<CatalogMCP> => ({
  total: 2,
  items: [
    {
      id: "figma",
      label: pick({ en: "Figma MCP", ko: "Figma MCP", ja: "Figma MCP", id: "Figma MCP" }),
      description: pick({
        en: "Converts Figma designs into code",
        ko: "Figma 디자인을 코드로 변환",
        ja: "Figmaデザインをコードに変換",
        id: "Mengonversi desain Figma menjadi kode",
      }),
      category: "design",
      body_md: null,
    },
    {
      id: "github",
      label: pick({ en: "GitHub MCP", ko: "GitHub MCP", ja: "GitHub MCP", id: "GitHub MCP" }),
      description: pick({
        en: "Integrates with GitHub repositories",
        ko: "GitHub 저장소 연동",
        ja: "GitHubリポジトリとの連携",
        id: "Berintegrasi dengan repositori GitHub",
      }),
      category: "vcs",
      body_md: null,
    },
  ],
});

// ── 통합 검증 ────────────────────────────────────────────────────────────────
export const validateOk = (): IntegrationValidateResponse => ({
  valid: true,
  message: pick({
    en: "Connection succeeded.",
    ko: "연결에 성공했습니다.",
    ja: "接続に成功しました。",
    id: "Koneksi berhasil.",
  }),
});

export const registerInitialTasks: RegisterInitialTasksResponse = {
  linear_created: true,
  linear_issue_url: "https://linear.app/demo/issue/ABC-1",
  notion_created: false,
  notion_page_url: null,
  errors: [],
};

// ── ROI ──────────────────────────────────────────────────────────────────────
export const roiResult = (): RoiCalculateResponse => ({
  baseline_cost: 84_000_000,
  clickeye_cost: 24_000_000,
  savings: 60_000_000,
  savings_ratio: 0.71,
  baseline_days: 180,
  clickeye_days: 52,
  breakdown: [
    {
      role_key: "backend",
      label: pick({ en: "Backend", ko: "백엔드", ja: "バックエンド", id: "Backend" }),
      days: 24,
      rate: 600_000,
      subtotal: 14_400_000,
    },
    {
      role_key: "frontend",
      label: pick({ en: "Frontend", ko: "프론트엔드", ja: "フロントエンド", id: "Frontend" }),
      days: 16,
      rate: 550_000,
      subtotal: 8_800_000,
    },
    {
      role_key: "qa",
      label: pick({ en: "QA", ko: "QA", ja: "QA", id: "QA" }),
      days: 12,
      rate: 450_000,
      subtotal: 5_400_000,
    },
  ],
  rates_snapshot: {
    backend: { daily: 600_000 },
    frontend: { daily: 550_000 },
    qa: { daily: 450_000 },
  },
  formula_version: "demo-1",
});

// ── 최종 ─────────────────────────────────────────────────────────────────────
export function finalizeResponse(): FinalizeResponse {
  return {
    project_id: DEMO_PROJECT_ID,
    project_name: pick({
      en: "Demo Project",
      ko: "데모 프로젝트",
      ja: "デモプロジェクト",
      id: "Proyek Demo",
    }),
    session_id: DEMO_SESSION_ID,
    message: pick({
      en: "The project has been created.",
      ko: "프로젝트가 생성되었습니다.",
      ja: "プロジェクトが作成されました。",
      id: "Proyek telah dibuat.",
    }),
  };
}

// ── 기타 ─────────────────────────────────────────────────────────────────────
export const wizardPreviewEmpty = (step: string): WizardPreviewResponse => ({
  step,
  result: null,
  supported: false,
});

// 로그인 직후 랜딩하는 /projects 목록 — 빈 상태(새 솔루션 만들기 CTA로 위저드 유도).
export const projectListEmpty: ProjectListResponse = {
  items: [],
  total: 0,
};

// 위저드 완료 모달의 "Open project page"(→ /projects/{id}) 대비 — 생성된 데모 프로젝트.
export function demoProject(): ProjectResponse {
  return {
    id: DEMO_PROJECT_ID,
    owner_id: DEMO_USER_ID,
    name: pick({
      en: "Demo Project",
      ko: "데모 프로젝트",
      ja: "デモプロジェクト",
      id: "Proyek Demo",
    }),
    slug: "demo-project",
    description: pick({
      en: "AI triage helpdesk solution",
      ko: "AI 트리아지 헬프데스크 솔루션",
      ja: "AIトリアージヘルプデスクソリューション",
      id: "Solusi helpdesk triase AI",
    }),
    status: "active",
    settings: {},
    wizard_data: null,
    project_type: "new",
    bootstrap_status: "completed",
    pm_profile_id: "pm-backend-lead",
    prototype_session_id: DEMO_SESSION_ID,
    last_zip_downloaded_at: null,
    last_env_downloaded_at: null,
    anthropic_key_status: "n/a",
    linear_key_status: "n/a",
    created_at: TS,
    updated_at: TS,
  };
}

export const projectLinearStatus: ProjectLinearStatus = {
  credentials_saved: false,
  team_id: null,
  api_key_masked: null,
};

// 데모는 일반 멤버 권한 — admin 메뉴는 숨겨진다.
export const permissions: PermissionsResponse = {
  permissions: ["project:read", "project:write", "solution:create"],
  system_role: "member",
};
