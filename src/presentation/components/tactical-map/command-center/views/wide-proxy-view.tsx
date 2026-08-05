import React, { useState, useMemo, useCallback } from "react";
import { Search, Zap, Coins, ShieldAlert, Crosshair } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { calculateProxyOperationBudget } from "@/domain/politics/government-label.utility";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

export interface TargetCountryOption {
  id: string;
  name: string;
  flagCode: string;
  stability: number;
  gdp: number;
}

interface WideProxyViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function WideProxyView({
  nation,
  nationsMap,
  selectedTargetCode,
}: WideProxyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [desiredDrain, setDesiredDrain] = useState<number>(2);
  const { dispatchAction } = useGameActions();

  const countryOptions = useMemo<TargetCountryOption[]>(() => {
    if (!nationsMap) return [];
    const query = searchQuery.trim().toLowerCase();

    return Object.values(nationsMap)
      .filter((n) => n.id !== nation.id && n.isAlive)
      .map((n) => ({
        id: n.id,
        name: n.name,
        flagCode: n.flagCode || "IR",
        stability: n.government.stability,
        gdp: n.gdp,
      }))
      .filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.flagCode.toLowerCase().includes(query),
      );
  }, [nationsMap, nation.id, searchQuery]);

  const defaultTarget = useMemo(() => {
    if (selectedTargetCode) {
      const cleanCode = selectedTargetCode.toUpperCase();
      const matched = countryOptions.find(
        (c) =>
          c.id.toUpperCase() === cleanCode ||
          c.flagCode.toUpperCase() === cleanCode,
      );
      if (matched) return matched.id;
    }
    return countryOptions[0]?.id || "";
  }, [selectedTargetCode, countryOptions]);

  const [selectedTargetId, setSelectedTargetId] =
    useState<string>(defaultTarget);

  const selectedTargetNation = useMemo(() => {
    return countryOptions.find((c) => c.id === selectedTargetId) || null;
  }, [countryOptions, selectedTargetId]);

  const requiredBudget = useMemo(() => {
    if (!selectedTargetNation) return 0;
    return calculateProxyOperationBudget(
      selectedTargetNation.gdp,
      desiredDrain,
    );
  }, [selectedTargetNation, desiredDrain]);

  const handleFundProxy = useCallback(async () => {
    if (!selectedTargetNation || requiredBudget <= 0) return;

    const action = ActionFactory.fundProxyInfluence(
      nation.id,
      selectedTargetId,
      requiredBudget,
    );

    const formattedCost = PersianNumberFormatter.formatCurrency(requiredBudget);

    await dispatchAction(
      action,
      `عملیات پنهان علیه ${selectedTargetNation.name} با موفقیت اجرا شد. ثبات کشور هدف به میزان -${PersianNumberFormatter.toPersianDigits(desiredDrain)}٪ کاهش یافت. (هزینه: ${formattedCost})`,
    );
  }, [
    nation.id,
    selectedTargetId,
    requiredBudget,
    desiredDrain,
    selectedTargetNation,
    dispatchAction,
  ]);

  const canAfford = nation.treasury >= requiredBudget;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dir-rtl text-right">
        <div className="lg:col-span-5 space-y-3 bg-background/30 p-4 border border-border/60 rounded-3xl">
          <div className="flex items-center gap-2 pb-1">
            <Crosshair size={14} className="text-military" />
            <span className="text-xs font-bold text-foreground">
              انتخاب کشور هدف عملیات
            </span>
          </div>

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

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {countryOptions.map((target) => {
              const isSelected = target.id === selectedTargetId;
              const flag = getFlagEmoji(target.flagCode);
              return (
                <button
                  key={target.id}
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? "bg-secondary border-primary font-bold shadow-sm"
                      : "bg-background/40 border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-xl select-none"
                      role="img"
                      aria-label={target.name}
                    >
                      {flag}
                    </span>
                    <span>{target.name}</span>
                  </div>
                  <span className="font-mono text-[9px] bg-background px-2 py-0.5 rounded text-muted-foreground">
                    ثبات:{" "}
                    {PersianNumberFormatter.toPersianDigits(target.stability)}٪
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4 bg-background/40 p-5 border border-border/80 rounded-3xl">
          {selectedTargetNation ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <span
                    className="text-3xl select-none"
                    role="img"
                    aria-label={selectedTargetNation.name}
                  >
                    {getFlagEmoji(selectedTargetNation.flagCode)}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">
                      عملیات نفوذ پنهان علیه {selectedTargetNation.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ثبات سیاسی فعلی:{" "}
                      {PersianNumberFormatter.toPersianDigits(
                        selectedTargetNation.stability,
                      )}
                      ٪ | تولید ناخالص:{" "}
                      {PersianNumberFormatter.formatCurrency(
                        selectedTargetNation.gdp,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-sans">
                    میزان افت ثبات مورد نظر:
                  </span>
                  <span className="font-bold text-military text-sm">
                    -{PersianNumberFormatter.toPersianDigits(desiredDrain)}٪
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={desiredDrain}
                  onChange={(e) => setDesiredDrain(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg"
                />

                <PercentageSelector
                  options={[
                    { pct: 2, label: "-۲٪ (۱٪ GDP)" },
                    { pct: 5, label: "-۵٪ (۲.۵٪ GDP)" },
                    { pct: 10, label: "-۱۰٪ (۵٪ GDP)" },
                    { pct: 15, label: "-۱۵٪ (حداکثر)", isMax: true },
                  ]}
                  onSelect={(val) => setDesiredDrain(val)}
                  colorVariant="military"
                />

                <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-2 text-right font-sans">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-muted-foreground font-sans">
                      هزینه محاسباتی بر اساس GDP هدف:
                    </span>
                    <span className="font-bold text-gdp text-sm flex items-center gap-1">
                      <Coins size={14} />
                      {PersianNumberFormatter.formatCurrency(requiredBudget)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    هزینه نفوذ مستقیماً با اقتصاد و ساختار امنیتی کشور هدف
                    سنجیده می‌شود.
                  </p>
                </div>

                <div className="p-3 bg-military/10 border border-military/30 rounded-2xl flex items-center gap-2 text-[10px] text-military font-sans">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>
                    افت ثبات هدف، رشد اقتصادی، درآمد مالیاتی و ساختار اداری کشور
                    هدف را به شدت فلج خواهد کرد.
                  </span>
                </div>
              </div>

              <button
                onClick={handleFundProxy}
                disabled={requiredBudget <= 0 || !canAfford}
                className="w-full py-3.5 bg-military hover:bg-military/90 disabled:opacity-40 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-military/10 flex items-center justify-center gap-2"
              >
                <Zap size={15} />
                <span>
                  {!canAfford
                    ? "خزانه ناکافی جهت اجرای عملیات"
                    : `اجرای عملیات و کاهش -${PersianNumberFormatter.toPersianDigits(desiredDrain)}٪ ثبات ${selectedTargetNation.name}`}
                </span>
              </button>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-muted-foreground italic">
              یک کشور را از فهرست انتخاب کنید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
