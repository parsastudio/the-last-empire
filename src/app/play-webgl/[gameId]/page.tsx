"use client";

import React, { use } from "react";
import { WebGLTacticalWorkspace } from "@/presentation/components/tactical-map/final/layout/webgl-tactical-workspace";

interface WebGLPlayPageProps {
  params: Promise<{ gameId: string }>;
}

export default function WebGLPlayPage({ params }: WebGLPlayPageProps) {
  const resolvedParams = use(params);
  return <WebGLTacticalWorkspace gameId={resolvedParams.gameId} />;
}
