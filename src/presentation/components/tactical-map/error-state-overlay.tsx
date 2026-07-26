import React from "react";

interface ErrorStateOverlayProps {
  error: string | null;
}

export function ErrorStateOverlay({ error }: ErrorStateOverlayProps) {
  if (!error) {
    return null;
  }
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50 text-xs font-mono">
      {error}
    </div>
  );
}
