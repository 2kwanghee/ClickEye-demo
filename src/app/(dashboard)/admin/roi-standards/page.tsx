"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RoleGuard } from "@/components/common/role-guard";
import { RoiStandardsTable } from "@/components/admin/roi/roi-standards-table";

type Tab = "role_rate" | "solution_effort" | "complexity_multiplier";

const TAB_IDS: Tab[] = ["role_rate", "solution_effort", "complexity_multiplier"];

export default function AdminRoiStandardsPage() {
  const t = useTranslations("admin.roiStandards");
  const [tab, setTab] = useState<Tab>("role_rate");

  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("title")}</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-hover)] p-1">
          {TAB_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                tab === id
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {t(`tabs.${id}.label`)}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            {t(`tabs.${tab}.desc`)}
          </p>
          <RoiStandardsTable key={tab} category={tab} />
        </div>
      </div>
    </RoleGuard>
  );
}
