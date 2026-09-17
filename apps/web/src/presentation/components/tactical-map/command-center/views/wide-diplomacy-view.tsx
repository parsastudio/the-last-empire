import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DiplomacyListItem } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomacy-list-item";
import { CountryProfileStats } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import { AdvancedDiplomacyActions } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/advanced-diplomacy-actions";
import { DiplomacyTargetCard } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-target-card";
import { DiplomacyAlliesResolver } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-allies-resolver.utility";
import { Search, Globe, Shield } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { useWideDiplomacy } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-diplomacy";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry, NationTurnActivity } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface WideDiplomacyViewProps {
  selectedTargetCode?: string | null;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  provincesMap?: Record<string, Province>;
  turnActivity?: NationTurnActivity;
  currentTurn?: number;
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
  turnActivity,
  currentTurn,
}: WideDiplomacyViewProps) {
  const t = useTranslations("diplomacy.view");
  const { toDigits, countryTranslator, locale } = useLocaleFormatter();
  const [mobileTab, setMobileTab] = useState<"list" | "details">("details");

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

  const targetAllies = useMemo(() => {
    return DiplomacyAlliesResolver.resolveAllies(
      diplomacy.selectedTargetNation,
      nationsMap,
      provincesMap,
      activeHumanId,
      countryTranslator,
      locale,
    );
  }, [
    diplomacy.selectedTargetNation,
    nationsMap,
    provincesMap,
    activeHumanId,
    countryTranslator,
    locale,
  ]);

  const handleSelectCountry = (code: string) => {
    diplomacy.setActiveCode(code);
    setMobileTab("details");
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200 text-start font-sans">
      <div className="flex md:hidden items-center gap-1.5 p-1 bg-secondary/60 border border-border/80 rounded-xl w-full">
        <button
          type="button"
          onClick={() => setMobileTab("details")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "details"
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield size={13} />
          <span>
            {t("dossierTab", { name: diplomacy.selectedRelation.name })}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "list"
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe size={13} />
          <span>
            {t("rosterTab", {
              count: toDigits(diplomacy.filteredRelations.length),
            })}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-5 items-start">
        <div
          className={`md:col-span-5 lg:col-span-4 space-y-2.5 md:space-y-3 bg-background/30 p-3 md:p-3.5 border border-border/60 rounded-2xl md:rounded-3xl ${
            mobileTab === "list" ? "block" : "hidden md:block"
          }`}
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={diplomacy.searchQuery}
              onChange={(e) => diplomacy.setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl py-1.5 md:py-2 ps-9 pe-3 text-xs text-foreground text-start focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2 max-h-[420px] md:max-h-[580px] overflow-y-auto pe-1 pb-2 touch-pan-y overscroll-contain scrollbar-thin scrollbar-thumb-border/60">
            {diplomacy.filteredRelations.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground italic">
                {t("noResults")}
              </div>
            ) : (
              diplomacy.filteredRelations.map((rel) => (
                <DiplomacyListItem
                  key={rel.code}
                  relation={rel}
                  onSelect={(selected) => handleSelectCountry(selected.code)}
                />
              ))
            )}
          </div>
        </div>

        <div
          className={`md:col-span-7 lg:col-span-8 space-y-3 md:space-y-4 ${
            mobileTab === "details" ? "block" : "hidden md:block"
          }`}
        >
          <DiplomacyTargetCard
            name={diplomacy.selectedRelation.name}
            code={diplomacy.selectedRelation.code}
            flagCode={diplomacy.selectedRelation.flagCode}
            stance={diplomacy.selectedRelation.stance}
            alignment={diplomacy.selectedRelation.alignment}
            tension={diplomacy.selectedRelation.tension}
            posture={diplomacy.selectedRelation.posture}
            hasSecurityGuarantee={
              diplomacy.selectedRelation.hasSecurityGuarantee
            }
            isEmergencyProtectorate={
              diplomacy.selectedRelation.isEmergencyProtectorate
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 md:gap-4 items-start">
            <CountryProfileStats
              data={diplomacy.selectedRelation.profileData}
              allies={targetAllies}
              onSelectAlly={(code) => handleSelectCountry(code)}
            />
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
              turnActivity={turnActivity}
              currentTurn={currentTurn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
