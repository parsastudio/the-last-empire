"use client";

import React from "react";
import { ToastProvider } from "@/presentation/context/toast-context";
import { TacticalMapWorkspace } from "@/presentation/components/tactical-map/layout/tactical-map-workspace";

export default function MapTest6Page() {
  return (
    <ToastProvider>
      <TacticalMapWorkspace gameId="default_game" />
    </ToastProvider>
  );
}
