import React from "react";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { SelectNationView } from "@/presentation/components/select-nation/select-nation-view";
import { pickMessages } from "@/i18n/pick-messages";
import { ROUTE_MESSAGE_NAMESPACES } from "@/i18n/messages-config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SelectNationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const pageMessages = pickMessages(
    messages,
    ROUTE_MESSAGE_NAMESPACES.selectNation,
  );

  return (
    <NextIntlClientProvider messages={pageMessages}>
      <SelectNationView />
    </NextIntlClientProvider>
  );
}
