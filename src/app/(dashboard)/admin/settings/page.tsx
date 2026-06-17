import { getTranslations } from "next-intl/server";

import { RoleGuard } from "@/components/common/role-guard";
import { AppSettingsPanel } from "@/components/admin/app-settings-panel";

export default async function AdminSettingsPage() {
  const t = await getTranslations("admin.adminSettings");
  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("title")}</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {t("subtitle")}
          </p>
        </div>
        <AppSettingsPanel />
      </div>
    </RoleGuard>
  );
}
