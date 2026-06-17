"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ResetProjectDialogProps {
  projectName: string;
  isOpen: boolean;
  isResetting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetProjectDialog({
  projectName,
  isOpen,
  isResetting,
  onConfirm,
  onCancel,
}: ResetProjectDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const t = useTranslations("projects.reset");
  const tC = useTranslations("common");

  if (!isOpen) return null;

  const isConfirmEnabled = inputValue === projectName && !isResetting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        role="button"
        tabIndex={0}
        aria-label={tC("aria.close")}
      />

      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-2xl shadow-black/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
          <AlertTriangle className="h-6 w-6 text-amber-700" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{t("title")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          {t.rich("warning", {
            name: () => (
              <strong className="text-[var(--text-secondary)]">{projectName}</strong>
            ),
          })}
        </p>

        <ul className="mt-3 space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          <li>{t("itemWizard")}</li>
          <li>{t("itemTickets")}</li>
          <li>{t("itemSessions")}</li>
          <li>{t("itemArtifacts")}</li>
          <li>{t("itemAgents")}</li>
          <li>{t("itemConfigs")}</li>
          <li>{t("itemOverrides")}</li>
          <li>{t("itemLicense")}</li>
        </ul>

        <div className="mt-4">
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">
            {t.rich("confirmLabel", {
              name: () => (
                <strong className="text-[var(--text-secondary)]">{projectName}</strong>
              ),
            })}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={projectName}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => { setInputValue(""); onCancel(); }}
            className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            {tC("actions.cancel")}
          </button>
          <button
            type="button"
            onClick={() => { setInputValue(""); onConfirm(); }}
            disabled={!isConfirmEnabled}
            className="flex-1 rounded-xl bg-amber-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isResetting ? t("resetting") : t("resetBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
