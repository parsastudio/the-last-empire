import React from "react";
import { DiplomacyListView } from "./diplomacy-list-view";
import {
  DiplomacyDetailView,
  DiplomaticRelation,
} from "./diplomacy-detail-view";
import { Nation } from "@/domain/nation/nation.schema";
import { resolveProfileRelation } from "./utils/relation-resolver";
import { SidebarTabType } from "../../sidebar-tabs";
import { useDiplomacyTab } from "./hooks/use-diplomacy-tab";

interface DiplomacyTabProps {
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  selectedTargetCode?: string | null;
  onFocusCountry?: (code: string) => void;
  onNavigateTab?: (tab: SidebarTabType, targetCode?: string) => void;
}

export function DiplomacyTab({
  nationsMap,
  humanNationId = "NATION_118",
  selectedTargetCode,
  onFocusCountry,
  onNavigateTab,
}: DiplomacyTabProps) {
  const diplomacy = useDiplomacyTab({
    nationsMap,
    humanNationId,
    selectedTargetCode,
  });

  if (diplomacy.activeRelation) {
    const targetNationId = diplomacy.idResolver.resolveFullNationId(
      diplomacy.activeRelation.code,
    );
    const targetLiveNation = nationsMap ? nationsMap[targetNationId] : null;

    return (
      <DiplomacyDetailView
        relation={resolveProfileRelation(
          diplomacy.activeRelation.code,
          targetLiveNation,
        )}
        targetTreasury={targetLiveNation ? targetLiveNation.treasury : 350000}
        onBack={() => diplomacy.setSelectedRelationCode(null)}
        onFocusCountry={onFocusCountry}
        onOpenProxyCenter={() => {
          if (onNavigateTab) {
            onNavigateTab("proxy", targetNationId);
          }
        }}
      />
    );
  }

  return (
    <DiplomacyListView
      relations={diplomacy.relationsList}
      searchQuery={diplomacy.searchQuery}
      onSearchChange={diplomacy.setSearchQuery}
      onSelectRelation={(rel: DiplomaticRelation) =>
        diplomacy.setSelectedRelationCode(rel.code)
      }
    />
  );
}
