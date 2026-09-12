import React from "react";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { WebGLTacticalWorkspace } from "@/presentation/components/tactical-map/final/layout/webgl-tactical-workspace";
import { pickMessages } from "@/i18n/pick-messages";
import { ROUTE_MESSAGE_NAMESPACES } from "@/i18n/messages-config";

interface PlayPageProps {
  params: Promise<{ gameId: string; locale: string }>;
}

export default async function DynamicPlayPage({ params }: PlayPageProps) {
  const { gameId, locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const gameplayMessages = pickMessages(
    messages,
    ROUTE_MESSAGE_NAMESPACES.gameplay,
  );

  return (
    <NextIntlClientProvider messages={gameplayMessages}>
      <WebGLTacticalWorkspace gameId={gameId} />
    </NextIntlClientProvider>
  );
}
