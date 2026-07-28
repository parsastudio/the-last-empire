import React, { useState } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { resolveProfileRelation } from "../../sidebar/tabs/diplomacy/utils/relation-resolver";
import { DiplomacyListItem } from "../../sidebar/tabs/diplomacy/diplomacy-list-item";
import { CountryProfileStats } from "../../sidebar/tabs/diplomacy/country-profile-stats";
import { AdvancedDiplomacyActions } from "../../sidebar/tabs/diplomacy/advanced-diplomacy-actions";
import { DiplomacyTargetCard } from "./components/diplomacy-target-card";
import { Search } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";

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
  const [activeCode, setActiveCode] = useState<string>(
    selectedTargetCode || "USA",
  );

  const relationsList = nationsMap
    ? Object.values(nationsMap).map((n) => {
        const rel = resolveProfileRelation(n.flagCode || n.id);
        const humanNation = nationsMap[humanNationId];
        if (humanNation) {
          const directRel = humanNation.relations[n.id];
          if (directRel) {
            rel.stance = directRel.stance;
            rel.opinion = directRel.opinion;
          }
        }
        return rel;
      })
    : ALL_COUNTRY_PROFILES.slice(0, 15).map((p) =>
        resolveProfileRelation(p.code),
      );

  const selectedRelation = resolveProfileRelation(activeCode);

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
            placeholder="جستجوی کشور..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right"
          />
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {relationsList
            .filter((r) =>
              r.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((rel) => (
              <DiplomacyListItem
                key={rel.code}
                relation={rel}
                onSelect={(selected) => setActiveCode(selected.code)}
              />
            ))}
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
            targetNationId={`NATION_${selectedRelation.code}`}
            nationId={humanNationId}
          />
        </div>
      </div>
    </div>
  );
}
