"use client";

import { Lock, Unlock, Tag, FileCode2, Clock, Hash } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CentralContractResponse } from "@/lib/api-client";

const TYPE_COLORS: Record<string, string> = {
  settings: "bg-blue-50 text-blue-700 border-blue-200",
  skill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  agent: "bg-violet-50 text-violet-700 border-violet-200",
  pipeline: "bg-amber-50 text-amber-700 border-amber-200",
};

/** 번역 키(`contracts.viewer.types.*`)가 존재하는 계약 타입 목록. */
export const CONTRACT_TYPE_KEYS = ["settings", "skill", "agent", "pipeline"] as const;

interface ContractViewerProps {
  contract: CentralContractResponse;
}

export function ContractViewer({ contract }: ContractViewerProps) {
  const t = useTranslations("contracts.viewer");
  const typeColor = TYPE_COLORS[contract.contract_type] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
  const typeLabel = (CONTRACT_TYPE_KEYS as readonly string[]).includes(
    contract.contract_type,
  )
    ? t(`types.${contract.contract_type}`)
    : contract.contract_type;

  return (
    <div className="space-y-6">
      {/* 메타 정보 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetaItem icon={Tag} label={t("slug")} value={contract.slug} />
        <MetaItem
          icon={FileCode2}
          label={t("type")}
          value={typeLabel}
          badge={typeColor}
        />
        <MetaItem icon={Hash} label={t("version")} value={contract.version} />
        <MetaItem
          icon={contract.is_locked ? Lock : Unlock}
          label={t("lock")}
          value={contract.is_locked ? t("locked") : t("editable")}
          badge={
            contract.is_locked
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }
        />
      </div>

      {/* 설명 */}
      {contract.description && (
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">{t("description")}</p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {contract.description}
          </p>
        </div>
      )}

      {/* 소스 + 날짜 */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1">
          {t("source")} <code className="rounded bg-zinc-100 px-1.5 py-0.5">{contract.source}</code>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {t("createdAt", { date: new Date(contract.created_at).toLocaleString("ko-KR") })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {t("updatedAt", { date: new Date(contract.updated_at).toLocaleString("ko-KR") })}
        </span>
      </div>

      {/* 허용 오버라이드 */}
      {contract.allowed_overrides.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
            {t("allowedOverrides")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contract.allowed_overrides.map((field) => (
              <span
                key={field}
                className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* JSON 콘텐츠 */}
      <div>
        <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">{t("content")}</p>
        <pre className="max-h-96 overflow-auto rounded-xl border border-[var(--border-subtle)] bg-zinc-50 p-4 text-xs leading-relaxed text-[var(--text-secondary)]">
          {JSON.stringify(contract.content, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/* 메타 아이템 */

interface MetaItemProps {
  icon: typeof Tag;
  label: string;
  value: string;
  badge?: string;
}

function MetaItem({ icon: Icon, label, value, badge }: MetaItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-hover)] px-3 py-2.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
        {badge ? (
          <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${badge}`}
          >
            {value}
          </span>
        ) : (
          <p className="truncate text-xs font-medium text-[var(--text-primary)]">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export { TYPE_COLORS };
