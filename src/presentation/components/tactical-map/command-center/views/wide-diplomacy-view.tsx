import React, { useState, useMemo } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { resolveProfileRelation } from "../../sidebar/tabs/diplomacy/utils/relation-resolver";
import { DiplomacyListItem } from "../../sidebar/tabs/diplomacy/diplomacy-list-item";
import { CountryProfileStats } from "../../sidebar/tabs/diplomacy/country-profile-stats";
import { AdvancedDiplomacyActions } from "../../sidebar/tabs/diplomacy/advanced-diplomacy-actions";
import { DiplomacyTargetCard } from "./components/diplomacy-target-card";
import { Search } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "../../sidebar/tabs/diplomacy/utils/nation-id-resolver";

interface WideDiplomacyViewProps {
  selectedTargetCode?: string | null;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  onFocusCountry?: (code: string) => void;
}

export function WideDiplomacyView({
  selectedTargetCode,
  nationsMap,
  humanNationId = "NATION_118",
}: WideDiplomacyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const idResolver = useMemo(() => new NationIdResolver(), []);

  const relationsList = useMemo(() => {
    if (nationsMap) {
      return Object.values(nationsMap)
        .filter((n) => n.id !== humanNationId && n.isAlive)
        .map((n) => {
          const rel = resolveProfileRelation(n.id, n);
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

    return ALL_COUNTRY_PROFILES.filter(
      (p) => `NATION_${p.id}` !== humanNationId,
    ).map((p) => resolveProfileRelation(p.code));
  }, [humanNationId, nationsMap]);

  const defaultCode = relationsList[0]?.code || "USA";
  const [activeCode, setActiveCode] = useState<string>(
    selectedTargetCode || defaultCode,
  );

  const filteredRelations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return relationsList;

    return relationsList.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        r.flagCode.toLowerCase().includes(query),
    );
  }, [relationsList, searchQuery]);

  const targetNationId = idResolver.resolveFullNationId(activeCode);
  const targetLiveNation = nationsMap ? nationsMap[targetNationId] : null;
  const selectedRelation = resolveProfileRelation(activeCode, targetLiveNation);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right"
          />
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredRelations.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground italic">
              هیچ کشوری با این عبارت یافت نشد.
            </div>
          ) : (
            filteredRelations.map((rel) => (
              <DiplomacyListItem
                key={rel.code}
                relation={rel}
                onSelect={(selected) => setActiveCode(selected.code)}
              />
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-8 space-y-5">
        <DiplomacyTargetCard
          name={selectedRelation.name}
          code={selectedRelation.code}
          flagCode={selectedRelation.flagCode}
          stance={selectedRelation.stance}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CountryProfileStats data={selectedRelation.profileData} />
          <AdvancedDiplomacyActions
            targetName={selectedRelation.name}
            targetNationId={targetNationId}
            nationId={humanNationId}
          />
        </div>
      </div>
    </div>
  );
}
