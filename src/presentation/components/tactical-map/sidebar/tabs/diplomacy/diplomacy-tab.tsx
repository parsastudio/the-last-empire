import React, { useState, useMemo } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { resolveProfileRelation } from "./utils/relation-resolver";
import { DiplomacyListView } from "./diplomacy-list-view";
import {
  DiplomacyDetailView,
  DiplomaticRelation,
} from "./diplomacy-detail-view";
import { Nation } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "./utils/nation-id-resolver";

interface DiplomacyTabProps {
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  selectedTargetCode?: string | null;
  onFocusCountry?: (code: string) => void;
}

export function DiplomacyTab({
  nationsMap,
  humanNationId = "NATION_118",
  selectedTargetCode,
  onFocusCountry,
}: DiplomacyTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelationCode, setSelectedRelationCode] = useState<
    string | null
  >(null);

  const idResolver = useMemo(() => new NationIdResolver(), []);

  const relationsList = useMemo(() => {
    if (nationsMap) {
      return Object.values(nationsMap).map((n) => {
        const rel = resolveProfileRelation(n.flagCode || n.id, n);
        const humanNation = nationsMap[humanNationId];
        if (humanNation) {
          const directRel = humanNation.relations[n.id];
          if (directRel) {
            rel.stance = directRel.stance;
            rel.opinion = directRel.opinion;
          }
        }
        return rel;
      });
    }
    return ALL_COUNTRY_PROFILES.slice(0, 15).map((p) =>
      resolveProfileRelation(p.code),
    );
  }, [humanNationId, nationsMap]);

  const activeCode = selectedTargetCode || selectedRelationCode;
  const activeRelation = useMemo(() => {
    if (!activeCode) return null;
    return (
      relationsList.find(
        (r) => r.code.toUpperCase() === activeCode.toUpperCase(),
      ) || null
    );
  }, [activeCode, relationsList]);

  if (activeRelation) {
    const targetNationId = idResolver.resolveFullNationId(activeRelation.code);
    const targetLiveNation = nationsMap ? nationsMap[targetNationId] : null;

    return (
      <DiplomacyDetailView
        relation={resolveProfileRelation(activeRelation.code, targetLiveNation)}
        targetTreasury={targetLiveNation ? targetLiveNation.treasury : 350000}
        onBack={() => setSelectedRelationCode(null)}
        onFocusCountry={onFocusCountry}
      />
    );
  }

  return (
    <DiplomacyListView
      relations={relationsList}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectRelation={(rel: DiplomaticRelation) =>
        setSelectedRelationCode(rel.code)
      }
    />
  );
}
