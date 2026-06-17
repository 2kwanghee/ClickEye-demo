"use client";

import { useTranslations } from "next-intl";

import type { PhaseDuration } from "@/lib/api-client";

const PHASE_KEYS = new Set([
  "requested",
  "decomposed",
  "assigned",
  "drafting",
  "reviewing",
  "revising",
  "approved",
  "in_development",
  "validated",
  "released",
]);

interface PhaseVelocityChartProps {
  data: PhaseDuration[];
}

export function PhaseVelocityChart({ data }: PhaseVelocityChartProps) {
  const t = useTranslations("dashboard.phaseVelocity");
  const maxDuration = Math.max(...data.map((d) => d.avg_duration_seconds), 1);

  function formatDuration(seconds: number): string {
    if (seconds < 60) return t("duration.seconds", { value: Math.round(seconds) });
    if (seconds < 3600) return t("duration.minutes", { value: Math.round(seconds / 60) });
    return t("duration.hours", { value: (seconds / 3600).toFixed(1) });
  }

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">
        {t("title")}
      </h3>
      <p className="mb-4 text-xs text-[var(--text-muted)]">
        {t("subtitle")}
      </p>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          {t("emptyState")}
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const label = PHASE_KEYS.has(item.phase) ? t(`phases.${item.phase}`) : item.phase;
            const pct = (item.avg_duration_seconds / maxDuration) * 100;

            return (
              <div key={item.phase} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-right text-xs text-[var(--text-secondary)]">
                  {label}
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-zinc-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      minWidth: item.avg_duration_seconds > 0 ? "8px" : "0",
                    }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-medium text-[var(--text-primary)]">
                  {formatDuration(item.avg_duration_seconds)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-right text-xs text-[var(--text-muted)]">
          {t("sampleCount", { count: data.reduce((s, d) => s + d.sample_count, 0) })}
        </div>
      )}
    </div>
  );
}
