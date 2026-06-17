import { getTranslations } from "next-intl/server";

import { RoleGuard } from "@/components/common/role-guard";
import { RegistryListTable } from "@/components/admin/registry/registry-list-table";

export default async function AdminRegistryHooksPage() {
  const t = await getTranslations("admin.registryHooks");
  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("title")}</h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{t("subtitle")}</p>
          </div>
        </div>
        <RegistryListTable type="hooks" />
      </div>
    </RoleGuard>
  );
}
