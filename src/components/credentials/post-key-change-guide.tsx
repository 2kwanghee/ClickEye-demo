"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Check, Copy, Download, KeyRound, RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiClient, ApiClientError, type ProjectResponse } from "@/lib/api-client";

interface PostKeyChangeGuideProps {
  open: boolean;
  onClose: () => void;
  channel: "anthropic" | "linear";
  staleProjects: ProjectResponse[];
  token: string;
}

const STEP_DEFS: {
  labelKey: string;
  detailKey?: string;
  code?: string;
}[] = [
  { labelKey: "steps.step1Label", detailKey: "steps.step1Detail" },
  { labelKey: "steps.step2Label", code: "cp ~/Downloads/.env /path/to/project/.env" },
  { labelKey: "steps.step3Label", code: "bash scripts/refresh-env.sh" },
  { labelKey: "steps.step4Label", detailKey: "steps.step4Detail" },
];

function CopyButton({ text }: { text: string }) {
  const t = useTranslations("credentials.guide");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      title={t("copy")}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function ProjectEnvRow({ project, token }: { project: ProjectResponse; token: string }) {
  const t = useTranslations("credentials.guide");
  const [envLoading, setEnvLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadEnv = useCallback(async () => {
    setEnvLoading(true);
    setError(null);
    try {
      const blob = await apiClient.projects.downloadEnv(token, project.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ".env";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.detail : t("envDownloadFail"));
    } finally {
      setEnvLoading(false);
    }
  }, [token, project.id]);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-hover)] px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{project.name}</p>
          {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadEnv}
            disabled={envLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
          >
            {envLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {t("downloadEnv")}
          </button>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            {t("redownloadZip")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PostKeyChangeGuide({
  open,
  onClose,
  channel,
  staleProjects,
  token,
}: PostKeyChangeGuideProps) {
  const t = useTranslations("credentials.guide");
  if (!open) return null;

  const channelLabel = channel === "anthropic" ? "Anthropic" : "Linear";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <KeyRound className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {t("title", { channel: channelLabel })}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-6 py-5 space-y-5">
          {/* 영향 받는 프로젝트 */}
          {staleProjects.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {t("affectedProjects", { count: staleProjects.length })}
              </p>
              <div className="space-y-2">
                {staleProjects.map((p) => (
                  <ProjectEnvRow key={p.id} project={p} token={token} />
                ))}
              </div>
            </div>
          )}

          {/* 단계별 가이드 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--text-secondary)]">{t("localApplyTitle")}</p>
            <ol className="space-y-3">
              {STEP_DEFS.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-secondary)]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-primary)]">{t(step.labelKey)}</p>
                    {step.code && (
                      <div className="mt-1.5 flex items-center rounded-md bg-zinc-900 px-3 py-1.5">
                        <code className="flex-1 text-xs text-zinc-100 font-mono select-all">
                          {step.code}
                        </code>
                        <CopyButton text={step.code} />
                      </div>
                    )}
                    {step.detailKey && (
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{t(step.detailKey)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* 푸터 */}
        <div className="border-t border-[var(--border-subtle)] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
