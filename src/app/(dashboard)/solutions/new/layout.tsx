import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("solutions.meta");
  return {
    title: t("newTitle"),
    description: t("newDescription"),
  };
}

export default function NewSolutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
