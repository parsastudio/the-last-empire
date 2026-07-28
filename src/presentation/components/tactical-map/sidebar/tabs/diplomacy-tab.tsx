import React, { useState } from "react";
import {
  ALL_COUNTRY_PROFILES,
  findCountryProfileByCode,
} from "@/domain/map/countries";
import {
  DiplomaticRelation,
  DiplomacyDetailView,
} from "./diplomacy/diplomacy-detail-view";
import { DiplomacyListView } from "./diplomacy/diplomacy-list-view";

interface DiplomacyTabProps {
  selectedTargetCode?: string | null;
  onFocusCountry?: (code: string) => void;
}

export function DiplomacyTab({
  selectedTargetCode,
  onFocusCountry,
}: DiplomacyTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelation, setSelectedRelation] =
    useState<DiplomaticRelation | null>(null);
  const [prevTargetCode, setPrevTargetCode] = useState<string | null>(null);

  const resolveProfileRelation = (code: string): DiplomaticRelation => {
    const profile = findCountryProfileByCode(code);
    const rawGdp = profile ? profile.gdp / 1e9 : 50;
    const gdpBillion = Number.isInteger(rawGdp)
      ? rawGdp.toString()
      : rawGdp.toFixed(1);

    const rawPop = profile ? profile.population / 1e6 : 10;
    const popMillion = Number.isInteger(rawPop)
      ? rawPop.toString()
      : rawPop.toFixed(1);

    const name = profile ? profile.nameFa : `کشور ${code}`;
    const flagCode = profile ? profile.flagCode : code;
    const govType = profile?.startingGovernment ?? "DEMOCRACY";

    let govLabel = "دموکراسی";
    if (govType === "DICTATORSHIP") govLabel = "حکومت دیکتاتوری";
    else if (govType === "COMMUNISM") govLabel = "کمونیسم";
    else if (govType === "MONARCHY") govLabel = "پادشاهی";
    else if (govType === "FASCISM") govLabel = "فاشیسم";

    return {
      code: code.toUpperCase(),
      name,
      flagCode,
      stance: code.toUpperCase() === "USA" ? "WAR" : "PEACE",
      opinion: code.toUpperCase() === "USA" ? -75 : 0,
      description: `شناسنامه رسمی و آمار دفتری کشور ${name}.`,
      profileData: {
        gdp: `$${gdpBillion} میلیارد دلار`,
        population: `${popMillion} میلیون نفر`,
        techLevel: profile?.startingTechLevel ?? 1,
        governmentType: govLabel,
        stability: 80,
        corruption: 10,
      },
    };
  };

  if (selectedTargetCode && selectedTargetCode !== prevTargetCode) {
    setPrevTargetCode(selectedTargetCode);
    setSelectedRelation(resolveProfileRelation(selectedTargetCode));
  }

  const allRelationsList: DiplomaticRelation[] = ALL_COUNTRY_PROFILES.slice(
    0,
    15,
  ).map((p) => resolveProfileRelation(p.code));

  if (selectedRelation) {
    return (
      <DiplomacyDetailView
        relation={selectedRelation}
        onBack={() => {
          setSelectedRelation(null);
          setPrevTargetCode(null);
        }}
        onFocusCountry={onFocusCountry}
      />
    );
  }

  return (
    <DiplomacyListView
      relations={allRelationsList}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectRelation={setSelectedRelation}
    />
  );
}
