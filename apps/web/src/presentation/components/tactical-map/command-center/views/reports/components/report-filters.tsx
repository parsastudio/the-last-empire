import React from "react";
import {
  ShieldCheck,
  Globe2,
  Clock,
  Search,
  Swords,
  Users,
  Skull,
} from "lucide-react";
import { TurnLogCategory, TurnLogScope } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ReportFiltersProps {
  selectedScope: TurnLogScope;
  selectedTurn: number | "ALL";
  selectedCategory: TurnLogCategory | "ALL";
  searchQuery: string;
  availableTurns: number[];
  onScopeChange: (scope: TurnLogScope) => void;
  onTurnChange: (turn: number | "ALL") => void;
  onCategoryChange: (category: TurnLogCategory | "ALL") => void;
  onSearchChange: (query: string) => void;
}

export function ReportFilters({
  selectedScope,
  selectedTurn,
  selectedCategory,
  searchQuery,
  availableTurns,
  onScopeChange,
  onTurnChange,
  onCategoryChange,
  onSearchChange,
}: ReportFiltersProps) {
  const globalCategories: {
    id: TurnLogCategory | "ALL";
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "ALL", label: "تمام وقایع جهان", icon: Globe2 },
    { id: "GLOBAL_WAR", label: "جنگ‌ها و لشکرکشی‌ها", icon: Swords },
    { id: "GLOBAL_DIPLOMACY", label: "معاهدات بین‌الملل", icon: Users },
    { id: "GLOBAL_ANNEXATION", label: "فروپاشی و الحاق", icon: Skull },
  ];

  return (
    <div className="space-y-3.5 font-sans dir-rtl text-right">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onScopeChange("NATIONAL")}
          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
            selectedScope === "NATIONAL"
              ? "bg-primary/15 border-primary text-foreground shadow-lg shadow-primary/10 ring-1 ring-primary/40"
              : "bg-secondary/40 border-border/60 hover:bg-secondary/70 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3 text-right">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedScope === "NATIONAL"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-xs font-black block text-foreground">
                گزارش‌های حاکمیتی و داخلی کشور
              </span>
              <span className="text-[10px] text-muted-foreground">
                وقایع مالی، نظامی، عملیات سیاه و محرمانه
              </span>
            </div>
          </div>
          {selectedScope === "NATIONAL" && (
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
          )}
        </button>

        <button
          onClick={() => onScopeChange("GLOBAL")}
          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
            selectedScope === "GLOBAL"
              ? "bg-diplomacy/15 border-diplomacy text-foreground shadow-lg shadow-diplomacy/10 ring-1 ring-diplomacy/40"
              : "bg-secondary/40 border-border/60 hover:bg-secondary/70 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3 text-right">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedScope === "GLOBAL"
                  ? "bg-diplomacy text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <Globe2 size={20} />
            </div>
            <div>
              <span className="text-xs font-black block text-foreground">
                دیده‌بان اخبار بین‌الملل و جهان
              </span>
              <span className="text-[10px] text-muted-foreground">
                پوشش عمومی جنگ‌ها، معاهدات و سقوط دولت‌ها
              </span>
            </div>
          </div>
          {selectedScope === "GLOBAL" && (
            <span className="w-2.5 h-2.5 rounded-full bg-diplomacy animate-pulse shrink-0" />
          )}
        </button>
      </div>

      <div className="bg-background/40 border border-border/60 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold shrink-0 ml-1">
            <Clock size={13} className="text-primary" />
            <span>نوبت مورد نظر:</span>
          </div>

          <button
            onClick={() => onTurnChange(availableTurns[0] ?? 1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              selectedTurn === (availableTurns[0] ?? 1)
                ? "bg-gdp text-primary-foreground border-gdp shadow-sm"
                : "bg-secondary/50 text-muted-foreground border-border/60 hover:bg-secondary"
            }`}
          >
            دست جاری (نوبت{" "}
            {PersianNumberFormatter.toPersianDigits(availableTurns[0] ?? 1)})
          </button>

          {availableTurns.slice(1, 6).map((turn) => (
            <button
              key={turn}
              onClick={() => onTurnChange(turn)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                selectedTurn === turn
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/30 text-muted-foreground border-border/40 hover:bg-secondary/60"
              }`}
            >
              نوبت {PersianNumberFormatter.toPersianDigits(turn)}
            </button>
          ))}

          <button
            onClick={() => onTurnChange("ALL")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border ${
              selectedTurn === "ALL"
                ? "bg-foreground text-background border-foreground"
                : "bg-secondary/20 text-muted-foreground border-border/40 hover:bg-secondary/50"
            }`}
          >
            همه دست‌ها
          </button>
        </div>

        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجو در متن وقایع..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-1.5 pr-8 pl-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-right"
          />
        </div>
      </div>

      {selectedScope === "GLOBAL" && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {globalCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-diplomacy text-primary-foreground border-diplomacy shadow-sm"
                    : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
                }`}
              >
                <Icon size={12} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
