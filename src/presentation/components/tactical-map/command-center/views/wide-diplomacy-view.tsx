import React from "react";
import { DiplomacyListItem } from "../../sidebar/tabs/diplomacy/diplomacy-list-item";
import { CountryProfileStats } from "../../sidebar/tabs/diplomacy/country-profile-stats";
import { AdvancedDiplomacyActions } from "../../sidebar/tabs/diplomacy/advanced-diplomacy-actions";
import { DiplomacyTargetCard } from "./components/diplomacy-target-card";
import { Search } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { useWideDiplomacy } from "./hooks/use-wide-diplomacy";

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
  const diplomacy = useWideDiplomacy({
    selectedTargetCode,
    nationsMap,
    humanNationId,
  });

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CountryProfileStats data={diplomacy.selectedRelation.profileData} />
          <AdvancedDiplomacyActions
            targetName={diplomacy.selectedRelation.name}
            targetNationId={diplomacy.targetNationId}
            nationId={humanNationId}
          />
        </div>
      </div>
    </div>
  );
}
