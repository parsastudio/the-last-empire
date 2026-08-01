import React, { useState } from "react";
import { DiplomacyListItem } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomacy-list-item";
import { CountryProfileStats } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import { AdvancedDiplomacyActions } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/advanced-diplomacy-actions";
import { DiplomacyTargetCard } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-target-card";
import { FocusMapButton } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/focus-map-button";
import { Search } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { useWideDiplomacy } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-diplomacy";
import { ProxyAllocationModal } from "@/presentation/components/tactical-map/modals/proxy-allocation-modal";

interface WideDiplomacyViewProps {
  selectedTargetCode?: string | null;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  onFocusCountry?: (code: string) => void;
  onNavigateTab?: (tab: SidebarTabType, targetCode?: string) => void;
}

export function WideDiplomacyView({
  selectedTargetCode,
  nationsMap,
  humanNationId,
  onFocusCountry,
}: WideDiplomacyViewProps) {
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const activeHumanId = humanNationId || "NATION_USA";

  const diplomacy = useWideDiplomacy({
    selectedTargetCode,
    nationsMap,
    humanNationId: activeHumanId,
  });

  const humanNation = nationsMap ? nationsMap[activeHumanId] : null;
  const userTreasury = humanNation ? humanNation.treasury : 100000;

  const targetLiveNation = nationsMap
    ? nationsMap[diplomacy.targetNationId]
    : null;
  const targetStability = targetLiveNation
    ? targetLiveNation.government.stability
    : diplomacy.selectedRelation.profileData.stability;
  const targetGdp = targetLiveNation ? targetLiveNation.gdp : 50000000000;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
        <div className="lg:col-span-4 space-y-3 bg-background/30 p-4 border border-border/60 rounded-3xl">
          <div className="relative">
            <Search
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="جستجوی نام یا نماد کشور..."
              value={diplomacy.searchQuery}
              onChange={(e) => diplomacy.setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {diplomacy.filteredRelations.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground italic">
                هیچ کشوری با این عبارت یافت نشد.
              </div>
            ) : (
              diplomacy.filteredRelations.map((rel) => (
                <DiplomacyListItem
                  key={rel.code}
                  relation={rel}
                  onSelect={(selected) =>
                    diplomacy.setActiveCode(selected.code)
                  }
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <DiplomacyTargetCard
            name={diplomacy.selectedRelation.name}
            code={diplomacy.selectedRelation.code}
            flagCode={diplomacy.selectedRelation.flagCode}
            stance={diplomacy.selectedRelation.stance}
          />

          {onFocusCountry && (
            <FocusMapButton
              countryCode={diplomacy.selectedRelation.code}
              countryName={diplomacy.selectedRelation.name}
              onFocus={onFocusCountry}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CountryProfileStats
              data={diplomacy.selectedRelation.profileData}
            />
            <AdvancedDiplomacyActions
              targetName={diplomacy.selectedRelation.name}
              targetNationId={diplomacy.targetNationId}
              nationId={activeHumanId}
              currentStance={diplomacy.selectedRelation.stance}
              isTradeEmbargoed={diplomacy.selectedRelation.isTradeEmbargoed}
              onOpenProxyModal={() => setIsProxyModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <ProxyAllocationModal
        isOpen={isProxyModalOpen}
        targetNationId={diplomacy.targetNationId}
        targetName={diplomacy.selectedRelation.name}
        targetFlagCode={diplomacy.selectedRelation.flagCode}
        targetStability={targetStability}
        targetGdp={targetGdp}
        userTreasury={userTreasury}
        nationId={activeHumanId}
        onClose={() => setIsProxyModalOpen(false)}
      />
    </>
  );
}
