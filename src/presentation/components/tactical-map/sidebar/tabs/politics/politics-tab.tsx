import React from "react";
import { TaxControlCard } from "./tax-control-card";
import { RegimeChangeCard } from "./regime-change-card";
import { AntiCorruptionCard } from "./anti-corruption-card";

interface PoliticsTabProps {
  taxRate: number;
  governmentType: string;
}

export function PoliticsTab({ taxRate, governmentType }: PoliticsTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <TaxControlCard taxRate={taxRate} />
      <RegimeChangeCard governmentType={governmentType} />
      <AntiCorruptionCard />
    </div>
  );
}
