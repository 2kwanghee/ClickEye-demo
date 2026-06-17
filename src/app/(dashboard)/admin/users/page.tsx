"use client";

import { Suspense, useRef, useState } from "react";
import { Shield, Users, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { RoleGuard } from "@/components/common/role-guard";
import { useAdminUsers, useUpdateUserRole } from "@/hooks/use-rbac";
import type { SystemRole, UserAdminResponse } from "@/lib/api-client";

const ROLE_KEYS: SystemRole[] = ["superadmin", "admin", "member", "viewer"];

const ROLE_COLORS: Record<SystemRole, string> = {
  superadmin: "bg-red-50 text-red-700 border-red-200",
  admin: "bg-violet-50 text-violet-700 border-violet-200",
  member: "bg-blue-50 text-blue-700 border-blue-200",
  viewer: "bg-zinc-100 text-[var(--text-muted)] border-[var(--border-subtle)]",
};

function RoleBadge({ role }: { role: SystemRole }) {
  const t = useTranslations("admin.users");
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[role]}`}
    >
      {t(`roles.${role}`)}
    </span>
  );
}

interface RoleSelectProps {
  userId: string;
  currentRole: SystemRole;
}

function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const updateRole = useUpdateUserRole();
  const t = useTranslations("admin.users");
  const tT = useTranslations("toast.users");

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  };

  const handleSelect = (role: SystemRole) => {
    if (role === currentRole) {
      setOpen(false);
      return;
    }
    updateRole.mutate(
      { userId, data: { system_role: role } },
      {
        onSuccess: () => {
          toast.success(tT("roleChangeSuccess", { role: t(`roles.${role}`) }));
          setOpen(false);
        },
        onError: (err) => {
          toast.error(err.message || tT("roleChangeFail"));
          setOpen(false);
        },
      },
    );
  };

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        disabled={updateRole.isPending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-zinc-400 hover:bg-[var(--bg-hover)] disabled:opacity-50"
      >
        {t(`roles.${currentRole}`)}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-50 w-40 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 shadow-xl"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {ROLE_KEYS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelect(role)}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  role === currentRole
                    ? "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {t(`roles.${role}`)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserRow({ user }: { user: UserAdminResponse }) {
  const t = useTranslations("admin.users");
  const initials = user.display_name
    ? user.display_name.charAt(0).toUpperCase()
    : "U";

  return (
    <tr className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-700">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {user.display_name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <RoleBadge role={user.system_role} />
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            user.is_active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-zinc-100 text-[var(--text-muted)]"
          }`}
        >
          {user.is_active ? t("status.active") : t("status.inactive")}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
        {new Date(user.created_at).toLocaleDateString("ko-KR")}
      </td>
      <td className="px-4 py-3 text-right">
        <RoleSelect userId={user.id} currentRole={user.system_role} />
      </td>
    </tr>
  );
}

function UsersContent() {
  const t = useTranslations("admin.users");
  const { data: users, isLoading, error } = useAdminUsers();

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
          <Users className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("title")}</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-[var(--bg-hover)]"
            />
          ))}
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t("loadError")}
        </div>
      )}

      {/* 테이블 */}
      {users && (
        <>
          <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {t("headers.user")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {t("headers.role")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {t("headers.status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {t("headers.joinedAt")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {t("headers.changeRole")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            {t("totalUsers", { count: users.length })}
          </p>
        </>
      )}

      {/* 빈 상태 */}
      {users && users.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <Users className="h-12 w-12 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{t("emptyState")}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-[var(--bg-hover)]"
              />
            ))}
          </div>
        }
      >
        <UsersContent />
      </Suspense>
    </RoleGuard>
  );
}
