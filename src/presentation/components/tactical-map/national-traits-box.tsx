import React from "react";
import { NationTrait } from "@/domain/nation/nation.schema";

interface NationalTraitsBoxProps {
  traits: NationTrait[];
}

export function NationalTraitsBox({ traits }: NationalTraitsBoxProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.map((trait) => (
        <span
          key={trait}
          className="px-2.5 py-1 bg-slate-950/60 border border-slate-850 rounded-lg text-[9px] font-mono text-slate-400 uppercase tracking-wider"
        >
          {trait.replace("_", " ")}
        </span>
      ))}
    </div>
  );
}
