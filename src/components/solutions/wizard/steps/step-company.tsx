"use client";

import {
  Building2,
  Store,
  Network,
  Laptop,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

import { useSolutionWizardStore } from "@/stores/solution-wizard-store";
import type { BusinessType } from "@/types/solution-wizard";

/* -- 상수 -- */

const BUSINESS_TYPE_VALUES = ["b2b", "b2c", "b2b2c", "internal"] as const;
const BUSINESS_TYPE_ICONS: Record<BusinessType, typeof Building2> = {
  b2b: Building2,
  b2c: Store,
  b2b2c: Network,
  internal: Laptop,
};

/* -- Zod 스키마 팩토리 -- */

type TranslateFn = (key: string) => string;

function createSchema(t: TranslateFn) {
  return z.object({
    companyName: z
      .string()
      .min(1, t("companyName.required"))
      .max(200, t("companyName.max200")),
    mainProduct: z
      .string()
      .min(1, t("mainProduct.required"))
      .max(500, t("mainProduct.max500")),
    businessType: z.enum(["b2b", "b2c", "b2b2c", "internal"], {
      message: t("businessType.required"),
    }),
    companyDescription: z
      .string()
      .max(1000, t("companyDescription.max1000"))
      .optional(),
    solutionRequest: z
      .string()
      .min(10, t("solutionRequest.required"))
      .max(2000, t("solutionRequest.max2000")),
  });
}

type FormData = z.infer<ReturnType<typeof createSchema>>;

/* -- 컴포넌트 -- */

export function StepCompany() {
  const t = useTranslations("wizard.step1");
  const company = useSolutionWizardStore((s) => s.data.company);
  const setCompany = useSolutionWizardStore((s) => s.setCompany);

  const schema = useMemo(() => createSchema(t), [t]);

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: company.companyName,
      mainProduct: company.mainProduct,
      businessType: company.businessType ?? undefined,
      companyDescription: company.companyDescription,
      solutionRequest: company.solutionRequest,
    },
  });

  // 입력 변경 시 스토어 자동 저장
  const watchedValues = watch();
  useEffect(() => {
    setCompany({
      companyName: watchedValues.companyName ?? "",
      mainProduct: watchedValues.mainProduct ?? "",
      businessType: watchedValues.businessType ?? null,
      companyDescription: watchedValues.companyDescription ?? "",
      solutionRequest: watchedValues.solutionRequest ?? "",
    });
  }, [
    watchedValues.companyName,
    watchedValues.mainProduct,
    watchedValues.businessType,
    watchedValues.companyDescription,
    watchedValues.solutionRequest,
    setCompany,
  ]);

  return (
    <div className="space-y-6">
      {/* 회사 이름 */}
      <div className="space-y-2">
        <label
          htmlFor="company-name"
          className="block text-sm font-medium text-zinc-700"
        >
          {t("companyName.label")} <span className="text-red-600">*</span>
        </label>
        <input
          id="company-name"
          type="text"
          {...register("companyName")}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20"
          placeholder={t("companyName.placeholder")}
        />
        {errors.companyName && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.companyName.message}
          </p>
        )}
      </div>

      {/* 주력 제품/서비스 */}
      <div className="space-y-2">
        <label
          htmlFor="main-product"
          className="block text-sm font-medium text-zinc-700"
        >
          {t("mainProduct.label")} <span className="text-red-600">*</span>
        </label>
        <input
          id="main-product"
          type="text"
          {...register("mainProduct")}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20"
          placeholder={t("mainProduct.placeholder")}
        />
        {errors.mainProduct && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.mainProduct.message}
          </p>
        )}
      </div>

      {/* 비즈니스 유형 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          {t("businessType.label")} <span className="text-red-600">*</span>
        </label>
        <Controller
          name="businessType"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {BUSINESS_TYPE_VALUES.map((value) => {
                const Icon = BUSINESS_TYPE_ICONS[value];
                const selected = field.value === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    aria-pressed={selected}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      selected
                        ? "border-zinc-900 bg-zinc-50 shadow-sm ring-2 ring-zinc-900/10"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${selected ? "text-emerald-600" : "text-zinc-500"}`}
                    />
                    <span
                      className={`text-sm font-medium ${selected ? "text-zinc-950" : "text-zinc-700"}`}
                    >
                      {t(`businessType.options.${value}.label`)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {t(`businessType.options.${value}.description`)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.businessType && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.businessType.message}
          </p>
        )}
      </div>

      {/* 회사 설명 (선택) */}
      <div className="space-y-2">
        <label
          htmlFor="company-description"
          className="block text-sm font-medium text-zinc-700"
        >
          {t("companyDescription.label")}{" "}
          <span className="text-xs font-normal text-zinc-500">{t("companyDescription.optional")}</span>
        </label>
        <textarea data-gramm="false" data-gramm_editor="false"
          id="company-description"
          {...register("companyDescription")}
          rows={3}
          className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20"
          placeholder={t("companyDescription.placeholder")}
        />
        {errors.companyDescription && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.companyDescription.message}
          </p>
        )}
      </div>

      {/* 솔루션 요구사항 (자연어) */}
      <div className="space-y-2">
        <label
          htmlFor="solution-request"
          className="flex items-center gap-2 text-sm font-medium text-zinc-700"
        >
          <Sparkles className="h-4 w-4 text-emerald-600" />
          {t("solutionRequest.label")} <span className="text-red-600">*</span>
        </label>
        <p className="text-xs text-zinc-500">
          {t("solutionRequest.hint")}
        </p>
        <textarea data-gramm="false" data-gramm_editor="false"
          id="solution-request"
          {...register("solutionRequest")}
          rows={5}
          className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20"
          placeholder={t("solutionRequest.placeholder")}
        />
        <div className="flex items-center justify-between">
          {errors.solutionRequest ? (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {errors.solutionRequest.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-zinc-500">
            {watchedValues.solutionRequest?.length ?? 0} / 2000
          </span>
        </div>
      </div>
    </div>
  );
}
