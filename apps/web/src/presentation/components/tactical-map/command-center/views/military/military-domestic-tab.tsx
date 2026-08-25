import React from "react";
import { QuickMilitaryRecruitmentGrid } from "@/presentation/components/tactical-map/sidebar/tabs/military/quick-military-recruitment-grid";
import { Nation } from "@/domain/nation/nation.schema";

interface MilitaryDomesticTabProps {
  nation: Nation;
}

export function MilitaryDomesticTab({ nation }: MilitaryDomesticTabProps) {
  return (
    <div className="space-y-5 animate-fade-smooth dir-rtl text-right">
      <div className="p-3.5 bg-secondary/30 border border-border/60 rounded-2xl flex items-center justify-between">
        <h3 className="text-xs font-black text-foreground">
          خطوط تولید و صنایع دفاع بومی کشور
        </h3>
      </div>

      <QuickMilitaryRecruitmentGrid
        nationId={nation.id}
        treasury={nation.treasury}
        techLevel={nation.military.techLevel}
        industrialLevel={nation.industrialLevel}
      />
    </div>
  );
}
