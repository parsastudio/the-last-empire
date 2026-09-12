import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import {
  NationDetail,
  NationListItem,
} from "@/presentation/components/select-nation/nation-list-item";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface NationListSidebarProps {
  nations: NationDetail[];
  selectedId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectNation: (nation: NationDetail) => void;
}

export function NationListSidebar({
  nations,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelectNation,
}: NationListSidebarProps) {
  const t = useTranslations("selectNation.sidebar");
  const { toDigits } = useLocaleFormatter();

  const filteredNations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return nations;

    return nations.filter(
      (n) =>
        n.name.toLowerCase().includes(query) ||
        n.id.toLowerCase().includes(query) ||
        n.code.toLowerCase().includes(query),
    );
  }, [nations, searchQuery]);

  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm h-full min-h-0">
      <div className="p-2.5 sm:p-4 border-b border-border space-y-2 sm:space-y-3 shrink-0 text-start">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-foreground">
            {t("title")}
          </h2>
          <span className="text-[9px] sm:text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
            {t("nationsCount", { count: toDigits(nations.length) })}
          </span>
        </div>
        <div className="relative">
          <Search
            size={13}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-1.5 ps-8 pe-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-start"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 space-y-1.5 sm:space-y-2 scrollbar-thin scrollbar-thumb-border">
        {filteredNations.map((nation) => (
          <NationListItem
            key={nation.id}
            nation={nation}
            isSelected={selectedId === nation.id}
            onSelect={onSelectNation}
          />
        ))}
      </div>
    </div>
  );
}
