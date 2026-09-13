import React from "react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { MainMenuView } from "@/presentation/components/main-menu/main-menu-view";
import { pickMessages } from "@/i18n/pick-messages";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MainMenuPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allMessages = await getMessages();
  const pageMessages = pickMessages(allMessages, ["menu", "common"]);

  return (
    <NextIntlClientProvider locale={locale} messages={pageMessages}>
      <MainMenuView />
    </NextIntlClientProvider>
  );
}
