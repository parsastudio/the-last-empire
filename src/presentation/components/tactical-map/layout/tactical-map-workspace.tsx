"use client";

import React, { Suspense } from "react";
import { WebGLTacticalWorkspace } from "@/presentation/components/tactical-map/final/layout/webgl-tactical-workspace";

interface TacticalMapWorkspaceProps {
  gameId?: string;
}

export function TacticalMapWorkspace(props: TacticalMapWorkspaceProps) {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-background flex items-center justify-center text-muted-foreground text-xs font-mono">
          در حال راه‌اندازی سیستم ناوبری...
        </div>
      }
    >
      <WebGLTacticalWorkspace {...props} />
    </Suspense>
  );
}
