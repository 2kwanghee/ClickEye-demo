import { getTranslations } from "next-intl/server";

import { RoleGuard } from "@/components/common/role-guard";
import { PrototypeCatalogTable } from "@/components/admin/prototype-catalog/prototype-catalog-table";

export default async function AdminPrototypeCatalogPage() {
  const t = await getTranslations("admin.prototypeCatalog.page");
  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("title")}</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {t("subtitle")}
          </p>
        </div>
        <PrototypeCatalogTable />
      </div>
    </RoleGuard>
  );
}
