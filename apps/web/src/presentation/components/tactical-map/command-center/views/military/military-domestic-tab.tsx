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
    <div className="space-y-5 animate-fade-smooth dir-rtl text-right">
      <div className="p-3.5 bg-secondary/30 border border-border/60 rounded-2xl flex items-center justify-between">
        <h3 className="text-xs font-black text-foreground">
          خطوط تولید، صنایع دفاع بومی و ناوگان دریایی کشور
        </h3>
      </div>

      <QuickMilitaryRecruitmentGrid
        nation={nation}
        currentGdp={gdp}
        provincesMap={provincesMap}
      />
    </div>
  );
}
