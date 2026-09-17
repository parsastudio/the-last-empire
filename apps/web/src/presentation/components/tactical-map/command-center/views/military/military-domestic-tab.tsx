import React from "react";
import { QuickMilitaryRecruitmentGrid } from "@/presentation/components/tactical-map/sidebar/tabs/military/quick-military-recruitment-grid";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@geopolitics/domain";

interface MilitaryDomesticTabProps {
  nation: Nation;
  provincesMap?: Record<string, Province>;
}

export function MilitaryDomesticTab({
  nation,
  provincesMap,
}: MilitaryDomesticTabProps) {
  const gdp = getNationGdp(nation, provincesMap);

  return (
    <div className="space-y-4 animate-fade-smooth text-start font-sans">
      <QuickMilitaryRecruitmentGrid
        nation={nation}
        currentGdp={gdp}
        provincesMap={provincesMap}
      />
    </div>
  );
}
