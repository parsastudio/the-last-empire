import React from "react";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/i18n/pick-messages";
import { SelectNationView } from "@/presentation/components/select-nation/select-nation-view";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SelectNationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const pageMessages = pickMessages(messages, [
    "common",
    "selectNation",
    "countries",
    "governments",
  ]);

  return (
    <NextIntlClientProvider messages={pageMessages}>
      <SelectNationView />
    </NextIntlClientProvider>
  );
}
