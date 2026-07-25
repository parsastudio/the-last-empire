import React from "react";

interface LoadingStateOverlayProps {
  loading: boolean;
}

export function LoadingStateOverlay({ loading }: LoadingStateOverlayProps) {
  if (!loading) {
    return null;
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">
        Generating High-Fidelity 4K Tactical Map...
      </p>
    </div>
  );
}
