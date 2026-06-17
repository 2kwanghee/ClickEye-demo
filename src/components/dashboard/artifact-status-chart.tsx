"use client";

import { useTranslations } from "next-intl";

import type { ArtifactStatusCount } from "@/lib/api-client";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-zinc-400",
  reviewed: "bg-blue-500",
  revised: "bg-amber-500",
  approved: "bg-emerald-500",
  in_development: "bg-violet-500",
  validated: "bg-cyan-500",
  released: "bg-green-500",
};

interface ArtifactStatusChartProps {
  data: ArtifactStatusCount[];
}

export function ArtifactStatusChart({ data }: ArtifactStatusChartProps) {
  const t = useTranslations("dashboard.artifactStatus");
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
        {t("title")}
      </h3>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          {t("emptyState")}
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const cfg = {
              label: STATUS_COLOR[item.status] ? t(`labels.${item.status}`) : item.status,
              color: STATUS_COLOR[item.status] ?? "bg-zinc-400",
            };
            const pct = (item.count / maxCount) * 100;

            return (
              <div key={item.status} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-right text-xs text-[var(--text-secondary)]">
                  {cfg.label}
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-zinc-100">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${cfg.color}`}
                    style={{ width: `${pct}%`, minWidth: item.count > 0 ? "8px" : "0" }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-[var(--text-primary)]">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-right text-xs text-[var(--text-muted)]">
        {t("totalCount", { count: total })}
      </div>
    </div>
  );
}
