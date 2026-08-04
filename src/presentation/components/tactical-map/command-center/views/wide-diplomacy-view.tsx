import React from "react";
import { DiplomacyListItem } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomacy-list-item";
import { CountryProfileStats } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import { AdvancedDiplomacyActions } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/advanced-diplomacy-actions";
import { DiplomacyTargetCard } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-target-card";
import { Search, MapPin } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { useWideDiplomacy } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-diplomacy";

function FocusMapButton({
  countryCode,
  countryName,
  onFocus,
}: {
  countryCode: string;
  countryName: string;
  onFocus: (countryCode: string) => void;
}) {
  return (
    <button
      onClick={() => onFocus(countryCode)}
      className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
    >
      <MapPin size={14} className="text-military" />
      <span>تمرکز دوربین روی {countryName}</span>
    </button>
  );
}

interface WideDiplomacyViewProps {
  selectedTargetCode?: string | null;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  onFocusCountry?: (code: string) => void;
  onNavigateTab?: (
    tab: SidebarTabType,
    subTab?: string,
    targetCode?: string,
  ) => void;
}

export function WideDiplomacyView({
  selectedTargetCode,
  nationsMap,
  humanNationId,
  onFocusCountry,
  onNavigateTab,
}: WideDiplomacyViewProps) {
  const activeHumanId = humanNationId || "NATION_USA";

  const diplomacy = useWideDiplomacy({
    selectedTargetCode,
    nationsMap,
    humanNationId: activeHumanId,
  });

  const handleOpenProxy = () => {
    if (onNavigateTab) {
      onNavigateTab("proxy", undefined, diplomacy.selectedRelation.code);
    }
  };

  return (
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
                onSelect={(selected) => diplomacy.setActiveCode(selected.code)}
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
          <CountryProfileStats data={diplomacy.selectedRelation.profileData} />
          <AdvancedDiplomacyActions
            targetName={diplomacy.selectedRelation.name}
            targetNationId={diplomacy.targetNationId}
            nationId={activeHumanId}
            currentStance={diplomacy.selectedRelation.stance}
            isTradeEmbargoed={diplomacy.selectedRelation.isTradeEmbargoed}
            isLandNeighbor={diplomacy.isLandNeighbor}
            onOpenProxy={handleOpenProxy}
          />
        </div>
      </div>
    </div>
  );
}
