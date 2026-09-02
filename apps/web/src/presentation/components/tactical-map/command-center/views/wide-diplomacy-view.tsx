import React, { useMemo } from "react";
import { DiplomacyListItem } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomacy-list-item";
import { CountryProfileStats } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import { AdvancedDiplomacyActions } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/advanced-diplomacy-actions";
import { DiplomacyTargetCard } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-target-card";
import { DiplomacyAlliesBox } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-allies-box";
import { Search, MapPin } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { useWideDiplomacy } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-diplomacy";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";

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
      className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 font-sans"
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
  provincesMap?: Record<string, Province>;
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
  provincesMap,
  onFocusCountry,
  onNavigateTab,
}: WideDiplomacyViewProps) {
  const activeHumanId = CountryRegistry.resolveCanonicalId(
    humanNationId || "USA",
  );

  const humanNation = useMemo(() => {
    return nationsMap
      ? nationsMap[activeHumanId] || nationsMap[humanNationId || ""]
      : null;
  }, [nationsMap, activeHumanId, humanNationId]);

  const humanGdp = useMemo(() => {
    return humanNation ? getNationGdp(humanNation, provincesMap) : 100000000000;
  }, [humanNation, provincesMap]);

  const diplomacy = useWideDiplomacy({
    selectedTargetCode,
    nationsMap,
    humanNationId: activeHumanId,
    provincesMap,
  });

  const handleOpenEspionage = () => {
    if (onNavigateTab) {
      onNavigateTab("espionage", undefined, diplomacy.selectedRelation.code);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 dir-rtl text-right font-sans">
      <div className="lg:col-span-4 space-y-3 bg-background/30 p-4 border border-border/60 rounded-3xl">
        <DiplomacyAlliesBox
          targetNation={diplomacy.selectedTargetNation}
          nationsMap={nationsMap}
          provincesMap={provincesMap}
          humanNationId={activeHumanId}
          onSelectAlly={(code) => diplomacy.setActiveCode(code)}
        />

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
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right focus:outline-none focus:border-primary"
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
          alignment={diplomacy.selectedRelation.alignment}
          tension={diplomacy.selectedRelation.tension}
          posture={diplomacy.selectedRelation.posture}
          hasSecurityGuarantee={diplomacy.selectedRelation.hasSecurityGuarantee}
          isEmergencyProtectorate={
            diplomacy.selectedRelation.isEmergencyProtectorate
          }
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
            targetFlagCode={diplomacy.selectedRelation.flagCode}
            nationId={activeHumanId}
            senderGdp={humanGdp}
            targetGdp={diplomacy.selectedTargetGdp}
            currentStance={diplomacy.selectedRelation.stance}
            hasSecurityGuarantee={
              diplomacy.selectedRelation.hasSecurityGuarantee
            }
            isEmergencyProtectorate={
              diplomacy.selectedRelation.isEmergencyProtectorate
            }
            provincesMap={provincesMap}
            clientNation={humanNation}
            targetNation={diplomacy.selectedTargetNation}
            onOpenProxy={handleOpenEspionage}
          />
        </div>
      </div>
    </div>
  );
}
