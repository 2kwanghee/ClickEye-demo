"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, type Resolver, type UseFormRegister, type UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, Heart, Frown, MessageSquare, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { RoleGuard } from "@/components/common/role-guard";
import { pmProfiles, pmMarkdown, type PMProfileUpdateRequest, type PMRatingResponse } from "@/lib/api-client";
import { createPmProfileSchema, type PMProfileFormData } from "@/lib/validations/pm";
import { CollapsibleSection } from "@/components/admin/markdown/collapsible-section";
import { PMMarkdownPane } from "@/components/admin/pm/pm-markdown-pane";
import { TagInput } from "@/components/admin/pm/tag-input";
import { CompositionPanel } from "@/components/admin/pm/composition-panel";

function TranslationMissingBadge() {
  const tC = useTranslations("admin.common");
  return (
    <span className="ml-1 rounded px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium">
      {tC("translationMissing")}
    </span>
  );
}

interface PMEnTranslationSectionProps {
  register: UseFormRegister<PMProfileFormData>;
  watch: UseFormWatch<PMProfileFormData>;
}

function PMEnTranslationSection({ register, watch }: PMEnTranslationSectionProps) {
  const t = useTranslations("admin.pm");
  const nameEn = watch("name_en");
  const titleEn = watch("title_en");
  const descEn = watch("description_en");
  const bioEn = watch("bio_long_en");
  const missingCount = [nameEn, titleEn, descEn, bioEn].filter((v) => !v).length;

  return (
    <CollapsibleSection
      title={t("enTranslation.sectionTitle")}
      badge={missingCount > 0 ? t("enTranslation.missingCount", { count: missingCount }) : undefined}
    >
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        {t("enTranslation.note")}
      </p>
      <div className="space-y-3">
        <div>
          <label className="flex items-center text-xs text-[var(--text-muted)] mb-1">
            {t("enTranslation.nameLabel")}
            {!nameEn && <TranslationMissingBadge />}
          </label>
          <input
            {...register("name_en")}
            placeholder="e.g. Full-Stack PM"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="flex items-center text-xs text-[var(--text-muted)] mb-1">
            {t("enTranslation.titleLabel")}
            {!titleEn && <TranslationMissingBadge />}
          </label>
          <input
            {...register("title_en")}
            placeholder="e.g. Senior Product Manager"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="flex items-center text-xs text-[var(--text-muted)] mb-1">
            {t("enTranslation.descriptionLabel")}
            {!descEn && <TranslationMissingBadge />}
          </label>
          <input
            {...register("description_en")}
            placeholder="e.g. Specializes in SaaS product strategy"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="flex items-center text-xs text-[var(--text-muted)] mb-1">
            {t("enTranslation.bioLabel")}
            {!bioEn && <TranslationMissingBadge />}
          </label>
          <textarea data-gramm="false" data-gramm_editor="false"
            {...register("bio_long_en")}
            rows={5}
            placeholder="e.g. Experienced PM with 8+ years in SaaS..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}

interface PMEditFormInnerProps {
  profileId: string;
}

function PMEditFormInner({ profileId }: PMEditFormInnerProps) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? "";
  const qc = useQueryClient();
  const t = useTranslations("admin.pm");
  const tC = useTranslations("common.actions");
  const tV = useTranslations("validation");
  const tT = useTranslations("toast.pm");
  const tG = useTranslations("toast.generic");

  const [markdownText, setMarkdownText] = useState("");
  const [mdLoaded, setMdLoaded] = useState(false);
  const [mdDirty, setMdDirty] = useState(false);

  const pmProfileSchema = useMemo(() => createPmProfileSchema(tV), [tV]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["pm-profile-detail", profileId],
    queryFn: () => pmProfiles.get(token, profileId),
    enabled: !!token,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<PMProfileFormData>({
    resolver: zodResolver(pmProfileSchema) as Resolver<PMProfileFormData>,
    defaultValues: {
      name: "",
      slug: "",
      title: "",
      avatar_url: "",
      domain: "",
      description: "",
      bio_long: "",
      years_experience: "",
      is_active: true,
      language: "ko",
      specialties: [],
      tech_stack_tags: [],
      industry_tags: [],
      preferred_solution_types: [],
      supported_platforms: [],
      name_en: "",
      title_en: "",
      description_en: "",
      bio_long_en: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        slug: profile.slug,
        title: profile.title ?? "",
        avatar_url: profile.avatar_url ?? "",
        domain: profile.domain ?? "",
        description: profile.description ?? "",
        bio_long: profile.bio_long ?? "",
        years_experience: profile.years_experience ?? "",
        is_active: profile.is_active,
        language: profile.language ?? "ko",
        specialties: profile.specialties ?? [],
        tech_stack_tags: profile.tech_stack_tags ?? [],
        industry_tags: profile.industry_tags ?? [],
        preferred_solution_types: profile.preferred_solution_types ?? [],
        supported_platforms: profile.supported_platforms ?? [],
        name_en: profile.name_en ?? "",
        title_en: profile.title_en ?? "",
        description_en: profile.description_en ?? "",
        bio_long_en: profile.bio_long_en ?? "",
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    if (token && !mdLoaded) {
      pmMarkdown
        .get(token, profileId)
        .then((md) => { setMarkdownText(md); setMdLoaded(true); })
        .catch(() => toast.error(tT("markdownLoadFail")));
    }
  }, [token, profileId, mdLoaded, tT]);

  const updateMutation = useMutation({
    mutationFn: (data: PMProfileUpdateRequest) => pmProfiles.update(token, profileId, data),
    onSuccess: () => {
      toast.success(tT("updateSuccess"));
      qc.invalidateQueries({ queryKey: ["admin-pm-profiles"] });
      qc.invalidateQueries({ queryKey: ["pm-profile-detail", profileId] });
      setMdLoaded(false);
    },
    onError: (e: Error) => toast.error(e instanceof Error && e.message ? e.message : tG("saveFail")),
  });

  const mdUpdateMutation = useMutation({
    mutationFn: (md: string) => pmMarkdown.update(token, profileId, md),
    onSuccess: () => {
      toast.success(tT("markdownSaveSuccess"));
      setMdDirty(false);
      qc.invalidateQueries({ queryKey: ["admin-pm-profiles"] });
      qc.invalidateQueries({ queryKey: ["pm-profile-detail", profileId] });
      reset(undefined, { keepValues: true });
    },
    onError: (e: Error) => toast.error(e instanceof Error && e.message ? e.message : tG("saveFail")),
  });

  const onSubmit = (data: PMProfileFormData) => {
    const payload: PMProfileUpdateRequest = {
      name: data.name,
      slug: data.slug,
      title: data.title || null,
      avatar_url: data.avatar_url || null,
      domain: data.domain || null,
      description: data.description || null,
      bio_long: data.bio_long || null,
      years_experience: data.years_experience !== "" && data.years_experience !== undefined
        ? Number(data.years_experience)
        : null,
      is_active: data.is_active,
      language: data.language,
      specialties: data.specialties,
      tech_stack_tags: data.tech_stack_tags,
      industry_tags: data.industry_tags,
      preferred_solution_types: data.preferred_solution_types,
      supported_platforms: data.supported_platforms,
      name_en: data.name_en || null,
      title_en: data.title_en || null,
      description_en: data.description_en || null,
      bio_long_en: data.bio_long_en || null,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-[var(--text-muted)]">{t("loading")}</div>;
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {(error as Error).message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pm"
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToList")}
          </Link>
          <span className="text-[var(--border-medium)]">/</span>
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">{profile?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {mdDirty ? (
            <button
              type="button"
              onClick={() => mdUpdateMutation.mutate(markdownText)}
              disabled={mdUpdateMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {mdUpdateMutation.isPending ? tC("processing") : t("saveMd")}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={updateMutation.isPending || !isDirty}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {updateMutation.isPending ? tC("processing") : tC("save")}
          </button>
        </div>
      </div>

      {/* 블록 1: 기본 정보 */}
      <CollapsibleSection title={t("sections.basic")} defaultOpen>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.nameRequired")}</label>
            <input
              {...register("name")}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.slugRequired")}</label>
            <input
              {...register("slug")}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.title")}</label>
            <input
              {...register("title")}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.domain")}</label>
            <input
              {...register("domain")}
              placeholder={t("form.domainPlaceholder")}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Avatar URL</label>
            <input
              {...register("avatar_url")}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
            />
            {errors.avatar_url && <p className="mt-1 text-xs text-red-600">{errors.avatar_url.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.yearsExperience")}</label>
            <input
              type="number"
              {...register("years_experience")}
              min={0}
              max={50}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.language")}</label>
            <select
              {...register("language")}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
            >
              <option value="ko">{t("form.langKorean")}</option>
              <option value="en">{t("form.langEnglish")}</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              id="is_active"
              type="checkbox"
              {...register("is_active")}
              className="h-4 w-4 rounded border-[var(--border-medium)]"
            />
            <label htmlFor="is_active" className="text-sm text-[var(--text-secondary)]">{t("form.activeStatus")}</label>
          </div>
        </div>
      </CollapsibleSection>

      {/* 블록 2: 구성 컴포넌트 (팀) */}
      <CollapsibleSection title={t("sections.composition")} defaultOpen>
        <CompositionPanel profileId={profileId} />
      </CollapsibleSection>

      {/* 블록 3: 태그 */}
      <CollapsibleSection title={t("sections.specialtyTags")}>
        <Controller
          name="specialties"
          control={control}
          render={({ field }) => (
            <TagInput
              label={t("form.specialties")}
              values={field.value}
              onChange={field.onChange}
              placeholder={t("form.specialtiesPlaceholder")}
            />
          )}
        />
        <Controller
          name="preferred_solution_types"
          control={control}
          render={({ field }) => (
            <TagInput
              label={t("form.preferredSolutionTypes")}
              values={field.value}
              onChange={field.onChange}
              placeholder={t("form.preferredSolutionTypesPlaceholder")}
            />
          )}
        />
      </CollapsibleSection>

      {/* 블록 3: 자유서술 */}
      <CollapsibleSection title={t("sections.freeText")}>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">{t("form.description")}</label>
          <input
            {...register("description")}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">
            {t("form.bioLong")}
          </label>
          <textarea data-gramm="false" data-gramm_editor="false"
            {...register("bio_long")}
            rows={6}
            placeholder={t("form.bioLongPlaceholder")}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-zinc-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {t("form.bioLongHint")}
          </p>
        </div>
      </CollapsibleSection>

      {/* 블록 3-b: 영문 번역 */}
      <PMEnTranslationSection register={register} watch={watch} />

      {/* 블록 4: MD 전체 */}
      <PMMarkdownPane
        value={markdownText}
        onChange={(v) => { setMarkdownText(v); setMdDirty(true); }}
      />

      {/* 블록 5: SKILL (기술 스택) */}
      <CollapsibleSection title={t("sections.skill")}>
        <Controller
          name="tech_stack_tags"
          control={control}
          render={({ field }) => (
            <TagInput
              label={t("form.techStackTags")}
              values={field.value}
              onChange={field.onChange}
              placeholder={t("form.techStackTagsPlaceholder")}
            />
          )}
        />
      </CollapsibleSection>

      {/* 블록 6: AGENT (산업) */}
      <CollapsibleSection title={t("sections.agent")}>
        <Controller
          name="industry_tags"
          control={control}
          render={({ field }) => (
            <TagInput
              label={t("form.industryTags")}
              values={field.value}
              onChange={field.onChange}
              placeholder={t("form.industryTagsPlaceholder")}
            />
          )}
        />
      </CollapsibleSection>

      {/* 블록 6-b: 지원 플랫폼 */}
      <CollapsibleSection title={t("sections.supportedPlatforms")}>
        <Controller
          name="supported_platforms"
          control={control}
          render={({ field }) => (
            <TagInput
              label={t("form.supportedPlatforms")}
              values={field.value}
              onChange={field.onChange}
              placeholder={t("form.supportedPlatformsPlaceholder")}
            />
          )}
        />
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">
          {t("form.supportedPlatformsHint")}
        </p>
      </CollapsibleSection>

      {/* 블록 8: 사용자 피드백 */}
      <CollapsibleSection title={t("sections.feedback")} defaultOpen={false}>
        <PMFeedbackPanel profileId={profileId} />
      </CollapsibleSection>
    </form>
  );
}

/* ---------------------------------------------------------------------------
   PMFeedbackPanel — PM 피드백 요약 + 목록
--------------------------------------------------------------------------- */

function PMFeedbackPanel({ profileId }: { profileId: string }) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? "";
  const t = useTranslations("admin.pm");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const { data: metrics } = useQuery({
    queryKey: ["pm-profiles", profileId, "metrics"],
    queryFn: () => pmProfiles.getMetrics(token, profileId),
    enabled: !!token,
  });

  const { data: ratingsData, isLoading } = useQuery({
    queryKey: ["pm-profiles", profileId, "ratings", { offset: page * PAGE_SIZE }],
    queryFn: () =>
      pmProfiles.listRatings(token, profileId, {
        offset: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    enabled: !!token,
  });

  const totalPages = ratingsData ? Math.ceil(ratingsData.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryTile
          icon={<Heart className="h-4 w-4 fill-rose-500 text-rose-500" />}
          label={t("feedback.likes")}
          value={metrics?.like_count ?? 0}
          color="text-rose-700"
        />
        <SummaryTile
          icon={<Frown className="h-4 w-4 text-sky-600" />}
          label={t("feedback.dislikes")}
          value={metrics?.dislike_count ?? 0}
          color="text-sky-700"
        />
        <SummaryTile
          icon={<MessageSquare className="h-4 w-4 text-violet-600" />}
          label={t("feedback.totalFeedback")}
          value={metrics?.total_ratings ?? 0}
          color="text-violet-700"
        />
        <SummaryTile
          icon={<BarChart3 className="h-4 w-4 text-emerald-600" />}
          label={t("feedback.usageCount")}
          value={metrics?.usage_count ?? 0}
          color="text-emerald-700"
        />
      </div>

      {/* 피드백 목록 */}
      {isLoading ? (
        <p className="py-6 text-center text-sm text-[var(--text-muted)]">{t("loading")}</p>
      ) : ratingsData && ratingsData.items.length > 0 ? (
        <div className="space-y-2">
          {ratingsData.items.map((r: PMRatingResponse) => (
            <FeedbackEntry key={r.id} rating={r} />
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-[var(--text-muted)]">
          {t("feedback.empty")}
        </p>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--bg-hover)]"
          >
            {t("pagination.prev")}
          </button>
          <span className="text-xs text-[var(--text-muted)]">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--bg-hover)]"
          >
            {t("pagination.next")}
          </button>
        </div>
      )}
    </div>
  );
}

interface SummaryTileProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function SummaryTile({ icon, label, value, color }: SummaryTileProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-hover)] py-4">
      {icon}
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

function FeedbackEntry({ rating }: { rating: PMRatingResponse }) {
  const t = useTranslations("admin.pm");
  const date = new Date(rating.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-hover)] px-4 py-3">
      <div className="mt-0.5 shrink-0">
        {rating.reaction === "like" ? (
          <Heart className="h-4 w-4 fill-rose-500 text-rose-500" aria-label={t("feedback.likes")} />
        ) : rating.reaction === "dislike" ? (
          <Frown className="h-4 w-4 text-sky-600" aria-label={t("feedback.dislikes")} />
        ) : (
          <MessageSquare className="h-4 w-4 text-[var(--text-muted)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {rating.comment ? (
          <p className="text-sm text-[var(--text-secondary)]">{rating.comment}</p>
        ) : (
          <p className="text-sm italic text-[var(--text-muted)]">{t("feedback.noComment")}</p>
        )}
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{date}</p>
      </div>
    </div>
  );
}

export function PMEditForm({ profileId }: { profileId: string }) {
  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <PMEditFormInner profileId={profileId} />
    </RoleGuard>
  );
}
