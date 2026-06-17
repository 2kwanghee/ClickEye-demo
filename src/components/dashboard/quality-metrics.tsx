"use client";

import {
  FileCheck,
  BarChart3,
  Star,
  RotateCcw,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type { QualityMetrics as QualityMetricsType } from "@/lib/api-client";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function MetricCard({ icon, label, value, sub, accent = "text-zinc-700" }: MetricCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-hover)] p-4">
      <div className={`mt-0.5 ${accent}`}>{icon}</div>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="mt-0.5 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
        {sub && <p className="text-xs text-[var(--text-muted)]">{sub}</p>}
      </div>
    </div>
  );
}

interface QualityMetricsProps {
  data: QualityMetricsType;
  sessionsTotal: number;
  subtasksTotal: number;
}

export function QualityMetrics({ data, sessionsTotal, subtasksTotal }: QualityMetricsProps) {
  const t = useTranslations("dashboard.quality");
  const releaseRate =
    data.total_artifacts > 0
      ? Math.round((data.released_artifacts / data.total_artifacts) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
        {t("title")}
      </h3>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard
          icon={<FileCheck className="h-4 w-4" />}
          label={t("artifacts")}
          value={`${data.released_artifacts}/${data.total_artifacts}`}
          sub={t("releaseRate", { rate: releaseRate })}
          accent="text-emerald-700"
        />
        <MetricCard
          icon={<Star className="h-4 w-4" />}
          label={t("avgReviewScore")}
          value={data.avg_review_score != null ? t("scoreValue", { score: data.avg_review_score }) : "—"}
          sub={t("reviewRounds", { count: data.review_rounds_total })}
          accent="text-amber-700"
        />
        <MetricCard
          icon={<RotateCcw className="h-4 w-4" />}
          label={t("avgRevisionCount")}
          value={t("revisionValue", { count: data.avg_revision_count })}
          accent="text-blue-700"
        />
        <MetricCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label={t("reviewCompletionRate")}
          value={`${data.review_completion_rate}%`}
          accent="text-cyan-700"
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4" />}
          label={t("sessions")}
          value={t("sessionsValue", { count: sessionsTotal })}
          accent="text-zinc-700"
        />
        <MetricCard
          icon={<Layers className="h-4 w-4" />}
          label={t("subtasks")}
          value={t("subtasksValue", { count: subtasksTotal })}
          accent="text-indigo-700"
        />
      </div>
    </div>
  );
}
