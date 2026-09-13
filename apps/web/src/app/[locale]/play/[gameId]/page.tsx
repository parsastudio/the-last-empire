import React from "react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { WebGLTacticalWorkspace } from "@/presentation/components/tactical-map/final/layout/webgl-tactical-workspace";
import { pickMessages } from "@/i18n/pick-messages";

interface PlayPageProps {
  params: Promise<{ gameId: string; locale: string }>;
}

export default async function DynamicPlayPage({ params }: PlayPageProps) {
  const { gameId, locale } = await params;
  setRequestLocale(locale);

  const allMessages = await getMessages();
  const pageMessages = pickMessages(allMessages, [
    "common",
    "hud",
    "map",
    "overview",
    "military",
    "industry",
    "projects",
    "politics",
    "diplomacy",
    "espionage",
    "reports",
    "attack",
    "dilemmas",
    "gameOver",
    "governments",
    "countries",
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={pageMessages}>
      <WebGLTacticalWorkspace gameId={gameId} />
    </NextIntlClientProvider>
  );
}
