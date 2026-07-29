"use client";

import React, { use } from "react";
import { TacticalMapWorkspace } from "@/presentation/components/tactical-map/layout/tactical-map-workspace";

interface PlayPageProps {
  params: Promise<{ gameId: string }>;
}

export default function DynamicPlayPage({ params }: PlayPageProps) {
  const resolvedParams = use(params);
  return <TacticalMapWorkspace gameId={resolvedParams.gameId} />;
}
