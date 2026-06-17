import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Home, SearchX } from "lucide-react";

export default async function NotFoundPage() {
  const t = await getTranslations("common.notFound");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <SearchX className="h-8 w-8 text-zinc-500" />
        </div>
        <h1 className="mt-6 text-4xl font-bold text-zinc-950">404</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {t("description")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800"
        >
          <Home className="h-4 w-4" />
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
