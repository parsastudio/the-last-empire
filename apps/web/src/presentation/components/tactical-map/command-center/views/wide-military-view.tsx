import React, { useState } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  MilitarySubTabsHeader,
  MilitarySubTabType,
} from "@/presentation/components/tactical-map/command-center/views/military/military-sub-tabs-header";
import { MilitaryOverviewTab } from "@/presentation/components/tactical-map/command-center/views/military/military-overview-tab";
import { MilitaryDomesticTab } from "@/presentation/components/tactical-map/command-center/views/military/military-domestic-tab";
import { MilitaryAlliedProcurementTab } from "@/presentation/components/tactical-map/command-center/views/military/military-allied-procurement-tab";
import { CountryRegistry } from "@/domain/data/countries";

interface WideMilitaryViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  selectedTargetCode?: string | null;
}

export function WideMilitaryView({
  nation,
  nationsMap,
  provincesMap,
  selectedTargetCode,
}: WideMilitaryViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<MilitarySubTabType>(
    selectedTargetCode ? "allies" : "overview",
  );

  const eligibleAlliesCount = React.useMemo(() => {
    if (!nationsMap) return 0;
    return Object.values(nationsMap).filter((n) => {
      if (!n.isAlive || n.id === nation.id) return false;
      const canonical = CountryRegistry.resolveCanonicalId(n.id);
      const rel = nation.relations[canonical] || nation.relations[n.id];
      const alignment = rel ? (rel.alignment ?? 0) : 0;
      const tension = rel ? (rel.tension ?? 10) : 10;
      return alignment >= 15 && tension < 60;
    }).length;
  }, [nationsMap, nation]);

  return (
    <div className="space-y-5 animate-fade-smooth dir-rtl text-right font-sans">
      <MilitarySubTabsHeader
        activeSubTab={activeSubTab}
        alliesCount={eligibleAlliesCount}
        onSelectSubTab={setActiveSubTab}
      />

      {activeSubTab === "overview" && (
        <MilitaryOverviewTab nation={nation} provincesMap={provincesMap} />
      )}

      {activeSubTab === "domestic" && (
        <MilitaryDomesticTab nation={nation} provincesMap={provincesMap} />
      )}

      {activeSubTab === "allies" && (
        <MilitaryAlliedProcurementTab
          nation={nation}
          nationsMap={nationsMap}
          provincesMap={provincesMap}
          selectedTargetCode={selectedTargetCode}
        />
      )}
    </div>
  );
}
