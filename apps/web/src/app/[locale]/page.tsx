import React from "react";
import { setRequestLocale } from "next-intl/server";
import { MainMenuView } from "@/presentation/components/main-menu/main-menu-view";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MainMenuPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MainMenuView />;
}
