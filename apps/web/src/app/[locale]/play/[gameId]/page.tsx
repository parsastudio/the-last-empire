"use client";

import React, { use } from "react";
import { WebGLTacticalWorkspace } from "@/presentation/components/tactical-map/final/layout/webgl-tactical-workspace";

interface PlayPageProps {
  params: Promise<{ gameId: string; locale: string }>;
}

export default function DynamicPlayPage({ params }: PlayPageProps) {
  const resolvedParams = use(params);
  return <WebGLTacticalWorkspace gameId={resolvedParams.gameId} />;
}
