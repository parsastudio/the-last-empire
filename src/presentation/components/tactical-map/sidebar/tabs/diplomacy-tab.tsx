import React, { useState } from "react";
import { useGeopoliticsGame } from "@/presentation/hooks/game/use-geopolitics-game";
import {
  DiplomaticRelation,
  DiplomacyDetailView,
} from "./diplomacy-detail-view";
import { DiplomacyListView } from "./diplomacy-list-view";
import { resolveProfileRelation } from "./utils/relation-resolver";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";

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
  const { gameState } = useGeopoliticsGame();

  if (selectedTargetCode && selectedTargetCode !== prevTargetCode) {
    setPrevTargetCode(selectedTargetCode);
    setSelectedRelation(resolveProfileRelation(selectedTargetCode));
  }

  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId]
      : null;

  const allRelationsList: DiplomaticRelation[] = gameState
    ? Object.keys(gameState.nations)
        .filter((id) => id !== gameState.humanNationId)
        .map((id) => {
          const nation = gameState.nations[id];
          if (!nation) return resolveProfileRelation("USA");
          const rel = humanNation?.relations[id];
          return {
            code: nation.flagCode,
            name: nation.name,
            flagCode: nation.flagCode,
            stance: rel ? rel.stance : "PEACE",
            opinion: rel ? rel.opinion : 0,
            description: `شناسنامه رسمی و آمار دفتری کشور ${nation.name}.`,
            profileData: {
              gdp: `$${(nation.gdp / 1e9).toFixed(1)} میلیارد دلار`,
              population: `${(nation.population / 1e6).toFixed(1)} میلیون نفر`,
              techLevel: nation.military.techLevel,
              governmentType: nation.government.type,
              stability: nation.government.stability,
              corruption: nation.government.corruption,
              militaryStrength: `${(nation.military.infantry + nation.military.airForce * 3).toLocaleString("fa-IR")} یگان`,
            },
          };
        })
    : ALL_COUNTRY_PROFILES.slice(0, 15).map((p) =>
        resolveProfileRelation(p.code),
      );

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
