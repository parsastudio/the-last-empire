import React from "react";
import { useTranslations } from "next-intl";
import { Landmark } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { PoliticalStabilityCard } from "./components/political-stability-card";
import { GlobalReputationCard } from "./components/global-reputation-card";

interface GovernmentStatusSectionProps {
  stability: number;
  reputation: number;
  nation?: Nation | null;
}

export function GovernmentStatusSection({
  stability,
  reputation,
  nation,
}: GovernmentStatusSectionProps) {
  const t = useTranslations("overview.governance");

  const stabilityDelta = nation
    ? StabilityCalculator.calculateTurnStabilityDelta(nation)
    : 0;

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={14} className="text-diplomacy" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          {t("title")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <PoliticalStabilityCard
          stability={stability}
          stabilityDelta={stabilityDelta}
        />
        <GlobalReputationCard reputation={reputation} />
      </div>
    </div>
  );
}
