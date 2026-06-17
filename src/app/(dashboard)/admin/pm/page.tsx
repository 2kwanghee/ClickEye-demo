"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Users, Pencil, Trash2, AlertCircle, CheckCircle2, XCircle, Heart, Frown } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { RoleGuard } from "@/components/common/role-guard";
import {
  pmProfiles,
  type PMProfileWithMetrics,
  type PMProfileCreateRequest,
} from "@/lib/api-client";

function PMListPage() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? "";
  const qc = useQueryClient();
  const t = useTranslations("admin.pm");
  const tC = useTranslations("common.actions");
  const tCommon = useTranslations("admin.common");
  const tT = useTranslations("toast.pm");
  const tG = useTranslations("toast.generic");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<PMProfileCreateRequest>({
    name: "",
    slug: "",
    title: "",
    domain: "",
    description: "",
    bio_long: "",
    is_active: true,
    specialties: [],
    tech_stack_tags: [],
    industry_tags: [],
    preferred_solution_types: [],
    language: "ko",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-pm-profiles"],
    queryFn: async () => {
      const list = await pmProfiles.list(token, { limit: 100 });
      const withMetrics = await Promise.all(
        list.items.map((p) => pmProfiles.get(token, p.id)),
      );
      return { items: withMetrics, total: list.total };
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (req: PMProfileCreateRequest) => pmProfiles.create(token, req),
    onSuccess: () => {
      toast.success(tT("createSuccess"));
      qc.invalidateQueries({ queryKey: ["admin-pm-profiles"] });
      setShowCreate(false);
      setCreateForm({
        name: "", slug: "", title: "", domain: "", description: "",
        bio_long: "", is_active: true, specialties: [], tech_stack_tags: [],
        industry_tags: [], preferred_solution_types: [], language: "ko",
      });
    },
    onError: (e: Error) => toast.error(e instanceof Error && e.message ? e.message : tG("saveFail")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pmProfiles.delete(token, id),
    onSuccess: () => {
      toast.success(tT("deleteSuccess"));
      qc.invalidateQueries({ queryKey: ["admin-pm-profiles"] });
    },
    onError: (e: Error) => toast.error(e instanceof Error && e.message ? e.message : tG("deleteFail")),
  });

  const handleCreate = () => {
    if (!createForm.name || !createForm.slug) {
      toast.error(tT("nameSlugRequired"));
      return;
    }
    createMutation.mutate(createForm);
  };

  const handleDelete = (pm: PMProfileWithMetrics) => {
    if (!confirm(t("list.deleteConfirm", { name: pm.name }))) return;
    deleteMutation.mutate(pm.id);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
            <Users className="h-5 w-5 text-[var(--text-secondary)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("list.title")}</h1>
            <p className="text-xs text-[var(--text-muted)]">{t("list.subtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          {t("list.createPm")}
        </button>
      </div>

      {/* 생성 다이얼로그 */}
      {showCreate && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t("list.createTitle")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.nameRequired")}</label>
              <input
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-zinc-400 focus:outline-none"
                placeholder={t("list.namePlaceholder")}
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Slug *</label>
              <input
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-zinc-400 focus:outline-none"
                placeholder={t("list.slugPlaceholder")}
                value={createForm.slug}
                onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.title")}</label>
              <input
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-zinc-400 focus:outline-none"
                placeholder={t("list.titlePlaceholder")}
                value={createForm.title ?? ""}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.domain")}</label>
              <input
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-zinc-400 focus:outline-none"
                placeholder={t("form.domainPlaceholder")}
                value={createForm.domain ?? ""}
                onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.description")}</label>
            <input
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-zinc-400 focus:outline-none"
              placeholder={t("list.descriptionPlaceholder")}
              value={createForm.description ?? ""}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              {createMutation.isPending ? tC("processing") : tC("create")}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)]"
            >
              {tC("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* 로딩/에러 */}
      {isLoading && (
        <div className="py-12 text-center text-sm text-[var(--text-muted)]">{t("loading")}</div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {(error as Error).message}
        </div>
      )}

      {/* PM 목록 */}
      {data && (
        <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{t("list.colName")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{t("list.colDomain")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{t("list.colSpecialty")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{t("list.colUsage")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{t("list.colFeedback")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{t("list.colStatus")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)]">{t("list.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((pm) => (
                <tr key={pm.id} className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{pm.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{pm.slug}</p>
                    {pm.title && <p className="text-xs text-[var(--text-muted)]">{pm.title}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pm.domain ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {pm.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
                        >
                          {s}
                        </span>
                      ))}
                      {pm.specialties.length > 3 && (
                        <span className="text-[10px] text-[var(--text-muted)]">+{pm.specialties.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                      {pm.usage_count}
                    </span>
                    <span className="ml-1 text-[10px] text-[var(--text-muted)]">{t("list.usageUnit")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-rose-700">
                        <Heart className="h-3 w-3 fill-rose-500 text-rose-500" aria-hidden="true" />
                        {pm.like_count}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-sky-700">
                        <Frown className="h-3 w-3" aria-hidden="true" />
                        {pm.dislike_count}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {pm.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> {tCommon("active")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <XCircle className="h-3 w-3" /> {tCommon("inactive")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pm/${pm.id}`}
                        className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      >
                        <Pencil className="h-3 w-3" />
                        {tCommon("edit")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(pm)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        {tC("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    {t("list.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPMPage() {
  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <PMListPage />
    </RoleGuard>
  );
}
