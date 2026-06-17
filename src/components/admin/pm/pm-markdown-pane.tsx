"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Code2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MarkdownEditor } from "@/components/admin/markdown/markdown-editor";

interface PMMarkdownPaneProps {
  value: string;
  onChange: (v: string) => void;
  defaultOpen?: boolean;
}

export function PMMarkdownPane({ value, onChange, defaultOpen = false }: PMMarkdownPaneProps) {
  const t = useTranslations("admin.pm.markdownPane");
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          )}
          <Code2 className="h-3.5 w-3.5 text-zinc-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {t("title")}
          </span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {t("subtitle")}
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--border-subtle)] px-5 py-4 space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            {t.rich("note", {
              code: (chunks) => (
                <code className="rounded bg-[var(--bg-hover)] px-1 text-[var(--text-secondary)]">{chunks}</code>
              ),
            })}
          </p>
          <MarkdownEditor value={value} onChange={onChange} rows={24} />
        </div>
      )}
    </div>
  );
}
