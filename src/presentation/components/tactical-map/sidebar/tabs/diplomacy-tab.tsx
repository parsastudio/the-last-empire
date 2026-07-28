import React, { useState } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import {
  DiplomaticRelation,
  DiplomacyDetailView,
} from "./diplomacy/diplomacy-detail-view";
import { DiplomacyListView } from "./diplomacy/diplomacy-list-view";
import { resolveProfileRelation } from "./diplomacy/utils/relation-resolver";

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
