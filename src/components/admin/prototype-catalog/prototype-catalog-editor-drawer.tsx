"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { PrototypeCatalogEntry } from "@/lib/api-client";
import {
  useCreateCatalogEntry,
  useUpdateCatalogEntry,
} from "@/hooks/use-prototype-catalog-admin";

type Tab = "basic" | "tech" | "proscons" | "agent";

const TAB_IDS: Tab[] = ["basic", "tech", "proscons", "agent"];

type FormState = {
  slug: string;
  title: string;
  description: string;
  tags: string;
  primary_tag: string;
  design_pattern: string;
  architecture_pattern: string;
  tech_stack_tags: string;
  ui_structure: string;
  menu_structure: string;
  color_palette: string;
  pros: string;
  cons: string;
  design_philosophy: string;
  implementation_constraints: string;
  recommended_agents: string;
  optional_agents: string;
  excluded_agents: string;
  recommended_skills: string;
  agent_strategy: string;
  task_distribution_guide: string;
  is_active: boolean;
  priority: string;
};

function entryToForm(entry: PrototypeCatalogEntry | null): FormState {
  if (!entry) {
    return {
      slug: "", title: "", description: "", tags: "", primary_tag: "",
      design_pattern: "", architecture_pattern: "", tech_stack_tags: "",
      ui_structure: "{}", menu_structure: "{}", color_palette: "{}",
      pros: "", cons: "", design_philosophy: "",
      implementation_constraints: "", recommended_agents: "", optional_agents: "",
      excluded_agents: "", recommended_skills: "", agent_strategy: "",
      task_distribution_guide: "", is_active: true, priority: "0",
    };
  }
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description ?? "",
    tags: (entry.tags ?? []).join(", "),
    primary_tag: entry.primary_tag ?? "",
    design_pattern: entry.design_pattern ?? "",
    architecture_pattern: entry.architecture_pattern ?? "",
    tech_stack_tags: (entry.tech_stack_tags ?? []).join(", "),
    ui_structure: JSON.stringify(entry.ui_structure ?? {}, null, 2),
    menu_structure: JSON.stringify(entry.menu_structure ?? {}, null, 2),
    color_palette: JSON.stringify(entry.color_palette ?? {}, null, 2),
    pros: (entry.pros ?? []).join("\n"),
    cons: (entry.cons ?? []).join("\n"),
    design_philosophy: entry.design_philosophy ?? "",
    implementation_constraints: (entry.implementation_constraints ?? []).join("\n"),
    recommended_agents: (entry.recommended_agents ?? []).join(", "),
    optional_agents: (entry.optional_agents ?? []).join(", "),
    excluded_agents: (entry.excluded_agents ?? []).join(", "),
    recommended_skills: (entry.recommended_skills ?? []).join(", "),
    agent_strategy: entry.agent_strategy ?? "",
    task_distribution_guide: entry.task_distribution_guide ?? "",
    is_active: entry.is_active,
    priority: String(entry.priority ?? 0),
  };
}

function parseList(val: string): string[] {
  return val.split("\n").map(s => s.trim()).filter(Boolean);
}

function parseTags(val: string): string[] {
  return val.split(",").map(s => s.trim()).filter(Boolean);
}

function parseJson(val: string): Record<string, unknown> {
  try { return JSON.parse(val) as Record<string, unknown>; } catch { return {}; }
}

interface PrototypeCatalogEditorDrawerProps {
  entry: PrototypeCatalogEntry | null;
  open: boolean;
  onClose: () => void;
}

export function PrototypeCatalogEditorDrawer({
  entry, open, onClose,
}: PrototypeCatalogEditorDrawerProps) {
  const [tab, setTab] = useState<Tab>("basic");
  const [form, setForm] = useState<FormState>(() => entryToForm(entry));

  const createMutation = useCreateCatalogEntry();
  const updateMutation = useUpdateCatalogEntry();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const t = useTranslations("admin.prototypeCatalog");
  const tC = useTranslations("common.actions");
  const tA = useTranslations("common.aria");
  const tT = useTranslations("toast.prototypeCatalog");

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug: form.slug,
      title: form.title,
      description: form.description || null,
      tags: parseTags(form.tags),
      primary_tag: form.primary_tag || null,
      design_pattern: form.design_pattern || null,
      architecture_pattern: form.architecture_pattern || null,
      tech_stack_tags: parseTags(form.tech_stack_tags),
      ui_structure: parseJson(form.ui_structure),
      menu_structure: parseJson(form.menu_structure),
      color_palette: parseJson(form.color_palette),
      pros: parseList(form.pros),
      cons: parseList(form.cons),
      design_philosophy: form.design_philosophy || null,
      implementation_constraints: parseList(form.implementation_constraints),
      recommended_agents: parseTags(form.recommended_agents),
      optional_agents: parseTags(form.optional_agents),
      excluded_agents: parseTags(form.excluded_agents),
      recommended_skills: parseTags(form.recommended_skills),
      agent_strategy: form.agent_strategy || null,
      task_distribution_guide: form.task_distribution_guide || null,
      is_active: form.is_active,
      priority: parseInt(form.priority, 10) || 0,
    };

    try {
      if (entry) {
        await updateMutation.mutateAsync({ id: entry.id, data: payload });
        toast.success(tT("updateSuccess"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(tT("createSuccess"));
      }
      onClose();
    } catch {
      toast.error(tT("saveFail"));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label={tA("close")}
      />
      <div className="relative w-full max-w-2xl h-full overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {entry ? t("drawer.editTitle") : t("drawer.newTitle")}
          </h2>
          <button type="button" onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={16} />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-[var(--border-subtle)] px-6">
          {TAB_IDS.map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`mr-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                tab === id
                  ? "border-zinc-900 text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {t(`tabs.${id}`)}
            </button>
          ))}
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 gap-4">
          {tab === "basic" && (
            <BasicTab form={form} set={set} isEdit={!!entry} />
          )}
          {tab === "tech" && (
            <TechTab form={form} set={set} />
          )}
          {tab === "proscons" && (
            <ProsConsTab form={form} set={set} />
          )}
          {tab === "agent" && (
            <AgentTab form={form} set={set} />
          )}

          <div className="sticky bottom-0 bg-[var(--bg-surface)] pt-4 flex justify-end gap-3 border-t border-[var(--border-subtle)] mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              {tC("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={12} className="animate-spin" />}
              {tC("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-zinc-400 focus:outline-none";
const TEXTAREA = `${INPUT} resize-y min-h-[80px]`;

type SetFn = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

function BasicTab({ form, set, isEdit }: { form: FormState; set: SetFn; isEdit: boolean }) {
  const t = useTranslations("admin.prototypeCatalog.fields");
  return (
    <>
      <Field label={t("slug")} hint={t("slugHint")}>
        <input className={INPUT} value={form.slug} onChange={set("slug")} required disabled={isEdit} />
      </Field>
      <Field label={t("title")}>
        <input className={INPUT} value={form.title} onChange={set("title")} required />
      </Field>
      <Field label={t("description")}>
        <textarea data-gramm="false" data-gramm_editor="false" className={TEXTAREA} value={form.description} onChange={set("description")} />
      </Field>
      <Field label={t("tags")} hint={t("tagsHint")}>
        <input className={INPUT} value={form.tags} onChange={set("tags")} />
      </Field>
      <Field label={t("primaryTag")} hint={t("primaryTagHint")}>
        <input className={INPUT} value={form.primary_tag} onChange={set("primary_tag")} />
      </Field>
      <Field label="Design Pattern" hint={t("designPatternHint")}>
        <input className={INPUT} value={form.design_pattern} onChange={set("design_pattern")} />
      </Field>
      <Field label="Architecture Pattern" hint={t("architecturePatternHint")}>
        <input className={INPUT} value={form.architecture_pattern} onChange={set("architecture_pattern")} />
      </Field>
      <div className="flex gap-4">
        <Field label={t("priority")}>
          <input type="number" className={INPUT} value={form.priority} onChange={set("priority")} />
        </Field>
        <Field label={t("active")}>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => {
                const val = e.target.checked;
                set("is_active")({ target: { value: String(val) } } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="rounded"
            />
            <span className="text-xs text-[var(--text-secondary)]">{t("activate")}</span>
          </label>
        </Field>
      </div>
    </>
  );
}

function TechTab({ form, set }: { form: FormState; set: SetFn }) {
  const t = useTranslations("admin.prototypeCatalog.fields");
  return (
    <>
      <Field label={t("techStackTags")} hint={t("techStackTagsHint")}>
        <input className={INPUT} value={form.tech_stack_tags} onChange={set("tech_stack_tags")} />
      </Field>
      <Field label="UI Structure (JSON)">
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[120px] font-mono text-xs`} value={form.ui_structure} onChange={set("ui_structure")} />
      </Field>
      <Field label="Menu Structure (JSON)">
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[80px] font-mono text-xs`} value={form.menu_structure} onChange={set("menu_structure")} />
      </Field>
      <Field label="Color Palette (JSON)">
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[80px] font-mono text-xs`} value={form.color_palette} onChange={set("color_palette")} />
      </Field>
    </>
  );
}

function ProsConsTab({ form, set }: { form: FormState; set: SetFn }) {
  const t = useTranslations("admin.prototypeCatalog.fields");
  return (
    <>
      <Field label={t("pros")}>
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[120px]`} value={form.pros} onChange={set("pros")} placeholder={t("prosPlaceholder")} />
      </Field>
      <Field label={t("cons")}>
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[120px]`} value={form.cons} onChange={set("cons")} placeholder={t("consPlaceholder")} />
      </Field>
    </>
  );
}

function AgentTab({ form, set }: { form: FormState; set: SetFn }) {
  const t = useTranslations("admin.prototypeCatalog.fields");
  return (
    <>
      <Field label={t("designPhilosophy")}>
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[100px]`} value={form.design_philosophy} onChange={set("design_philosophy")} />
      </Field>
      <Field label={t("implementationConstraints")}>
        <textarea data-gramm="false" data-gramm_editor="false" className={TEXTAREA} value={form.implementation_constraints} onChange={set("implementation_constraints")} />
      </Field>
      <Field label={t("recommendedAgents")} hint={t("recommendedAgentsHint")}>
        <input className={INPUT} value={form.recommended_agents} onChange={set("recommended_agents")} />
      </Field>
      <Field label={t("optionalAgents")}>
        <input className={INPUT} value={form.optional_agents} onChange={set("optional_agents")} />
      </Field>
      <Field label={t("excludedAgents")}>
        <input className={INPUT} value={form.excluded_agents} onChange={set("excluded_agents")} />
      </Field>
      <Field label={t("recommendedSkills")} hint={t("recommendedSkillsHint")}>
        <input className={INPUT} value={form.recommended_skills} onChange={set("recommended_skills")} />
      </Field>
      <Field label={t("agentStrategy")}>
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[100px]`} value={form.agent_strategy} onChange={set("agent_strategy")} />
      </Field>
      <Field label={t("taskDistributionGuide")}>
        <textarea data-gramm="false" data-gramm_editor="false" className={`${TEXTAREA} min-h-[100px]`} value={form.task_distribution_guide} onChange={set("task_distribution_guide")} />
      </Field>
    </>
  );
}
