import React from "react";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/i18n/pick-messages";
import { MainMenuView } from "@/presentation/components/main-menu/main-menu-view";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MainMenuPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const pageMessages = pickMessages(messages, ["common", "menu"]);

  return (
    <NextIntlClientProvider messages={pageMessages}>
      <MainMenuView />
    </NextIntlClientProvider>
  );
}
