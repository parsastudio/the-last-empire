import React from "react";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/i18n/pick-messages";
import { WebGLTacticalWorkspace } from "@/presentation/components/tactical-map/final/layout/webgl-tactical-workspace";

interface PlayPageProps {
  params: Promise<{ gameId: string; locale: string }>;
}

export default async function DynamicPlayPage({ params }: PlayPageProps) {
  const { gameId, locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const gameMessages = pickMessages(messages, [
    "common",
    "hud",
    "map",
    "countries",
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
    "selectNation",
  ]);

  return (
    <NextIntlClientProvider messages={gameMessages}>
      <WebGLTacticalWorkspace gameId={gameId} />
    </NextIntlClientProvider>
  );
}
