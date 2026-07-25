import React from "react";
import { NationalTraitsBox } from "./national-traits-box";
import { NationTrait } from "@/domain/nation/nation.schema";

interface TraitsOverlayProps {
  humanNation: { traits: NationTrait[] } | null;
}

export function TraitsOverlay({ humanNation }: TraitsOverlayProps) {
  if (!humanNation) {
    return null;
  }
  return (
    <div className="absolute bottom-20 left-4 z-40">
      <NationalTraitsBox traits={humanNation.traits} />
    </div>
  );
}
