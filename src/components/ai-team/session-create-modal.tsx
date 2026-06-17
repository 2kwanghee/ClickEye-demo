"use client";

import { useState } from "react";
import { X, Loader2, Sparkles, Check, Link2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { useCreateSession, useDecompose, useAssign, useGenerateDrafts, usePushToLinear } from "@/hooks/use-orchestrator";
import type { AnalysisResult, SubTaskResponse, SubTaskRole, PushToLinearResponse } from "@/lib/api-client";

type ModalStep = "form" | "decomposing" | "review" | "assigning" | "drafting" | "pushing" | "done";

interface SessionCreateModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (sessionId: string) => void;
}

export function SessionCreateModal({
  projectId,
  isOpen,
  onClose,
  onCreated,
}: SessionCreateModalProps) {
  const t = useTranslations("aiTeam");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState<ModalStep>("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [subtasks, setSubtasks] = useState<SubTaskResponse[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linearResult, setLinearResult] = useState<PushToLinearResponse | null>(null);
  const [linearError, setLinearError] = useState<string | null>(null);

  const create = useCreateSession(projectId);
  const decompose = useDecompose();
  const assign = useAssign();
  const generateDrafts = useGenerateDrafts();
  const pushToLinear = usePushToLinear();

  const reset = () => {
    setStep("form");
    setTitle("");
    setDescription("");
    setSessionId("");
    setSubtasks([]);
    setAnalysisResult(null);
    setError(null);
    setLinearResult(null);
    setLinearError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setError(null);

    try {
      const session = await create.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setSessionId(session.id);

      setStep("decomposing");
      const decomposeResult = await decompose.mutateAsync({
        sessionId: session.id,
      });
      setSubtasks(decomposeResult.subtasks);
      setAnalysisResult(decomposeResult.session.analysis_result ?? null);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("session.createFail"));
      setStep("form");
    }
  };

  const handleAssign = async () => {
    setStep("assigning");
    setError(null);
    try {
      const result = await assign.mutateAsync({ sessionId });
      setSubtasks(result.subtasks);

      // 초안 생성 → 자동 파이프라인 시작 (drafting → reviewing → integrating → validating)
      setStep("drafting");
      await generateDrafts.mutateAsync({ sessionId });

      // Linear 이슈 등록
      setStep("pushing");
      try {
        const pushed = await pushToLinear.mutateAsync({ sessionId });
        setLinearResult(pushed);
      } catch (pushErr) {
        const msg = pushErr instanceof Error && pushErr.message ? pushErr.message : t("session.linearPushFail");
        setLinearError(msg);
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("session.assignFail"));
      setStep("review");
    }
  };

  const handleDone = () => {
    onCreated(sessionId);
    handleClose();
  };

  if (!isOpen) return null;

  const KNOWN_ROLES: SubTaskRole[] = [
    "architect",
    "frontend",
    "backend",
    "qa",
    "security",
    "devops",
    "reviewer",
  ];
  const roleLabel = (role: SubTaskRole) =>
    KNOWN_ROLES.includes(role) ? t(`roles.${role}`) : role;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("session.title")}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl">
        {/* 닫기 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          aria-label={tCommon("aria.close")}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step: 폼 입력 */}
        {step === "form" && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
              {t("session.title")}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="session-title" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  {t("session.titleLabel")}
                </label>
                <input
                  id="session-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("session.titlePlaceholder")}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-zinc-400 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="session-desc" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  {t("session.descLabel")}
                </label>
                <textarea data-gramm="false" data-gramm_editor="false"
                  id="session-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t("session.descPlaceholder")}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                {tCommon("actions.cancel")}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!title.trim() || create.isPending}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {create.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t("session.createAndDecompose")}
              </button>
            </div>
          </>
        )}

        {/* Step: Decomposing */}
        {step === "decomposing" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <p className="text-sm text-[var(--text-secondary)]">{t("session.decomposing")}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {t("session.decomposingHint")}
            </p>
          </div>
        )}

        {/* Step: Review subtasks */}
        {step === "review" && (
          <>
            <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
              {t("session.reviewTitle")}
            </h2>
            <p className="mb-4 text-xs text-[var(--text-muted)]">
              {t("session.reviewSubtitle", { count: subtasks.length })}
            </p>

            {/* 분석 요약 카드 */}
            {analysisResult && (
              <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs">
                <div className="mb-1.5 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-medium text-zinc-700">{t("session.analysisResult")}</span>
                  <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                    {analysisResult.primary_tag}
                  </span>
                  {analysisResult.complexity && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                      {analysisResult.complexity}
                    </span>
                  )}
                </div>
                {analysisResult.features && analysisResult.features.length > 0 && (
                  <div className="mb-1">
                    <span className="text-zinc-500">{t("session.keyFeatures")} </span>
                    <span className="text-zinc-700">
                      {analysisResult.features.slice(0, 5).join(", ")}
                      {analysisResult.features.length > 5 && ` ${t("session.moreCount", { count: analysisResult.features.length - 5 })}`}
                    </span>
                  </div>
                )}
                {analysisResult.key_requirements && analysisResult.key_requirements.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {analysisResult.key_requirements.slice(0, 3).map((req, i) => (
                      <li key={i} className="flex items-start gap-1 text-zinc-600">
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-hover)] p-3"
                >
                  <span className="mt-0.5 shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
                    {roleLabel(st.assigned_role)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{st.title}</p>
                    {st.description && (
                      <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
                        {st.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                {tCommon("actions.cancel")}
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={assign.isPending}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {assign.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {t("session.confirmAssign")}
              </button>
            </div>
          </>
        )}

        {/* Step: Assigning */}
        {step === "assigning" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <p className="text-sm text-[var(--text-secondary)]">{t("session.assigning")}</p>
          </div>
        )}

        {/* Step: Drafting */}
        {step === "drafting" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-[var(--text-secondary)]">{t("session.startingPipeline")}</p>
            <p className="text-xs text-[var(--text-muted)]">{t("session.startingPipelineHint")}</p>
          </div>
        )}

        {/* Step: Pushing to Linear */}
        {step === "pushing" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            <p className="text-sm text-[var(--text-secondary)]">{t("session.pushing")}</p>
            <p className="text-xs text-[var(--text-muted)]">{t("session.pushingHint")}</p>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <>
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <Check className="h-6 w-6 text-emerald-700" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t("session.doneTitle")}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {t("session.doneSubtitle", { count: subtasks.length })}
              </p>
            </div>

            {/* Linear 결과 */}
            {linearResult && linearResult.count > 0 && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-emerald-700" />
                  <p className="text-xs font-medium text-emerald-700">
                    {t("session.linearPushDone", { count: linearResult.count })}
                  </p>
                  {linearResult.initial_state_applied && (
                    <span className="ml-auto rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {t("session.linearWaitBadge")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {linearResult.created_urls.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-700 underline hover:text-emerald-600"
                    >
                      {linearResult.created_identifiers[i] ?? url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {linearError && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                  <p className="text-xs font-medium text-amber-700">{t("session.linearPushFailTitle")}</p>
                </div>
                <p className="text-xs text-amber-700">
                  {linearError.includes("자격증명") ? (
                    t.rich("session.linearNoCredential", {
                      link: (chunks) => (
                        <Link href="/settings/linear" className="underline hover:text-amber-600">
                          {chunks}
                        </Link>
                      ),
                    })
                  ) : (
                    linearError
                  )}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleDone}
                className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                {t("session.goToDashboard")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
