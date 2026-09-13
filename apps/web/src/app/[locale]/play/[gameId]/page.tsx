import React from "react";
import { setRequestLocale } from "next-intl/server";
import { WebGLTacticalWorkspace } from "@/presentation/components/tactical-map/final/layout/webgl-tactical-workspace";

interface PlayPageProps {
  params: Promise<{ gameId: string; locale: string }>;
}

export default async function DynamicPlayPage({ params }: PlayPageProps) {
  const { gameId, locale } = await params;
  setRequestLocale(locale);

  return <WebGLTacticalWorkspace gameId={gameId} />;
}
