import React from "react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { SelectNationView } from "@/presentation/components/select-nation/select-nation-view";
import { pickMessages } from "@/i18n/pick-messages";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SelectNationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allMessages = await getMessages();
  const pageMessages = pickMessages(allMessages, [
    "selectNation",
    "governments",
    "countries",
    "common",
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={pageMessages}>
      <SelectNationView />
    </NextIntlClientProvider>
  );
}
