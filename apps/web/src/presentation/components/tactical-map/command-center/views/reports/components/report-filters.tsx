import React from "react";
import { Search, Filter, Layers, Clock } from "lucide-react";
import {
  TurnLogCategory,
  TurnLogLevel,
  TurnLogScope,
} from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ReportFiltersProps {
  searchQuery: string;
  selectedScope: TurnLogScope | "ALL";
  selectedCategory: TurnLogCategory | "ALL";
  selectedLevel: TurnLogLevel | "ALL";
  selectedTurn: number | "ALL";
  availableTurns: number[];
  onSearchChange: (query: string) => void;
  onScopeChange: (scope: TurnLogScope | "ALL") => void;
  onCategoryChange: (category: TurnLogCategory | "ALL") => void;
  onLevelChange: (level: TurnLogLevel | "ALL") => void;
  onTurnChange: (turn: number | "ALL") => void;
}

export function ReportFilters({
  searchQuery,
  selectedScope,
  selectedCategory,
  selectedLevel,
  selectedTurn,
  availableTurns,
  onSearchChange,
  onScopeChange,
  onCategoryChange,
  onLevelChange,
  onTurnChange,
}: ReportFiltersProps) {
  const scopeOptions: { id: TurnLogScope | "ALL"; label: string }[] = [
    { id: "ALL", label: "همه دامنه‌ها" },
    { id: "NATIONAL", label: "محرمانه ملی" },
    { id: "GLOBAL", label: "رویدادهای بین‌المللی" },
  ];

  const categoryOptions: { id: TurnLogCategory | "ALL"; label: string }[] = [
    { id: "ALL", label: "همه موضوعات" },
    { id: "MILITARY", label: "ستاد ارتش" },
    { id: "GLOBAL_WAR", label: "جنگ‌های جهان" },
    { id: "DIPLOMACY", label: "دیپلماسی ملی" },
    { id: "GLOBAL_DIPLOMACY", label: "معاهدات بین‌الملل" },
    { id: "ESPIONAGE", label: "عملیات ویژه و سیاه" },
    { id: "GLOBAL_ANNEXATION", label: "سقوط حاکمیت‌ها" },
    { id: "DOMESTIC", label: "امور مالی و داخلی" },
  ];

  const levelOptions: { id: TurnLogLevel | "ALL"; label: string }[] = [
    { id: "ALL", label: "همه سطوح" },
    { id: "CRITICAL", label: "بحرانی" },
    { id: "COMBAT", label: "نبرد" },
    { id: "WARNING", label: "هشدار" },
    { id: "INFO", label: "عادی" },
  ];

  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 font-sans dir-rtl text-right">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجو در پیام‌ها، نام کشورها یا کدهای رهگیری..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-right"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Clock size={14} className="text-primary shrink-0" />
          <select
            value={selectedTurn}
            onChange={(e) =>
              onTurnChange(
                e.target.value === "ALL" ? "ALL" : Number(e.target.value),
              )
            }
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 px-3 text-xs text-foreground font-mono focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">تمامی نوبت‌ها</option>
            {availableTurns.map((turn) => (
              <option key={turn} value={turn}>
                نوبت {PersianNumberFormatter.toPersianDigits(turn)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30 text-[11px]">
        <div className="flex items-center gap-1 text-muted-foreground shrink-0 font-bold">
          <Filter size={12} />
          <span>دامنه:</span>
        </div>
        {scopeOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onScopeChange(opt.id)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
              selectedScope === opt.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
            }`}
          >
            {opt.label}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-border/60 mx-1 hidden sm:block" />

        <div className="flex items-center gap-1 text-muted-foreground shrink-0 font-bold">
          <Layers size={12} />
          <span>سطح:</span>
        </div>
        {levelOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onLevelChange(opt.id)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
              selectedLevel === opt.id
                ? "bg-gdp text-primary-foreground border-gdp shadow-sm"
                : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {categoryOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onCategoryChange(opt.id)}
            className={`px-2 py-0.5 rounded-lg text-[10px] transition-all cursor-pointer border ${
              selectedCategory === opt.id
                ? "bg-secondary text-foreground border-primary font-bold shadow-inner"
                : "bg-background/40 text-muted-foreground border-border/40 hover:bg-secondary/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
