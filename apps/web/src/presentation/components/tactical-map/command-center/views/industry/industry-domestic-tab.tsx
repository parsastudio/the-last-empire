"use client";

import React, { useState } from "react";
import {
  Factory,
  Cpu,
  Hammer,
  TrendingUp,
  Loader2,
  Wrench,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { IndustryTechUpgradeCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/industry-tech-upgrade-card";

interface IndustryDomesticTabProps {
  nation: Nation;
  provincesMap?: Record<string, Province>;
}

export function IndustryDomesticTab({
  nation,
  provincesMap,
}: IndustryDomesticTabProps) {
  const [isModernizing, setIsModernizing] = useState<boolean>(false);
  const [rebuildingProvId, setRebuildingProvId] = useState<number | null>(null);
  const { dispatchAction } = useGameActions();

  const ownedProvinces = provincesMap
    ? Object.values(provincesMap).filter((p) => p.ownerNationId === nation.id)
    : [];

  let totalActiveFactories = 0;
  let totalMaxSlots = 0;
  let totalEmptySlots = 0;

  for (const p of ownedProvinces) {
    totalActiveFactories += p.factoriesCount;
    totalMaxSlots += p.maxSlots;
    totalEmptySlots += Math.max(0, p.maxSlots - p.factoriesCount);
  }

  const canModernize = nation.equipmentTechLevel < nation.industrialLevel;
  const modernizeCost =
    totalActiveFactories *
    IndustryCalculator.calculateModernizeUnitCost(
      nation.equipmentTechLevel,
      nation.industrialLevel,
    );
  const canAffordModernize =
    nation.treasury >= modernizeCost && modernizeCost > 0;

  const handleModernizeAll = async () => {
    if (isModernizing || !canAffordModernize) return;
    setIsModernizing(true);
    try {
      const action = ActionFactory.equipDomesticMachinery(nation.id);
      await dispatchAction(
        action,
        "تمامی کارخانجات کشور به خطوط تولید و ابزارآلات منطبق بر بالاترین سطح دانش بومی مجهز شدند.",
      );
    } finally {
      setIsModernizing(false);
    }
  };

  const handleRebuildFactory = async (provinceId: number) => {
    if (rebuildingProvId !== null) return;
    const cost = IndustryCalculator.FACTORY_REBUILD_COST;
    if (nation.treasury < cost) return;

    setRebuildingProvId(provinceId);
    try {
      const action = ActionFactory.buildFactory(nation.id, provinceId);
      await dispatchAction(
        action,
        "یک واحد کارخانه جدید با موفقیت در استان احداث و به بهره‌برداری رسید.",
      );
    } finally {
      setRebuildingProvId(null);
    }
  };

  const factoryYield = IndustryCalculator.calculateFactoryYield(
    nation.equipmentTechLevel,
  );

  return (
    <div className="space-y-6 dir-rtl text-right font-sans animate-in fade-in duration-200">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Factory size={12} className="text-gdp" />
            <span>کارخانجات فعال</span>
          </span>
          <span className="text-base font-black font-mono text-foreground block">
            {PersianNumberFormatter.formatNumberWithCommas(
              totalActiveFactories,
            )}
            <span className="text-xs text-muted-foreground font-normal mr-1">
              / {PersianNumberFormatter.formatNumberWithCommas(totalMaxSlots)}
            </span>
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-400" />
            <span>بازدهی هر واحد</span>
          </span>
          <span className="text-sm font-black font-mono text-emerald-400 block">
            {PersianNumberFormatter.formatCurrency(factoryYield, true)}
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Cpu size={12} className="text-primary" />
            <span>دانش بومی (R&D)</span>
          </span>
          <span className="text-sm font-black font-mono text-primary block">
            لِوِل{" "}
            {PersianNumberFormatter.toPersianDigits(
              nation.industrialLevel.toFixed(1),
            )}
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Hammer size={12} className="text-gdp" />
            <span>تراز تجهیزات خطوط</span>
          </span>
          <span className="text-sm font-black font-mono text-gdp block">
            لِوِل{" "}
            {PersianNumberFormatter.toPersianDigits(
              nation.equipmentTechLevel.toFixed(1),
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <IndustryTechUpgradeCard
          nationId={nation.id}
          treasury={nation.treasury}
          industrialLevel={nation.industrialLevel}
        />

        <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-primary/15 text-primary border border-primary/30">
                  <Hammer size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground">
                    نوسازی و تجهیز بومی خطوط تولید
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    به‌روزرسانی ادوات کارخانه‌ها تا سقف آخرین لول دانش داخلی
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground font-sans">
                هزینه نوسازی سراسری{" "}
                {PersianNumberFormatter.formatNumberWithCommas(
                  totalActiveFactories,
                )}{" "}
                کارخانه:
              </span>
              <span className="font-bold text-foreground">
                {canModernize
                  ? PersianNumberFormatter.formatCurrency(modernizeCost)
                  : "مجهز به سقف دانش"}
              </span>
            </div>
          </div>

          <button
            onClick={handleModernizeAll}
            disabled={!canModernize || !canAffordModernize || isModernizing}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
          >
            {isModernizing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : canModernize ? (
              <Sparkles size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>
              {!canModernize
                ? "تمام کارخانه‌ها مجهز به آخرین لول هستند"
                : !canAffordModernize
                  ? "موجودی خزانه برای نوسازی کافی نیست"
                  : `اجرای نوسازی سراسری (${PersianNumberFormatter.formatCurrency(modernizeCost)})`}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-card/90 border border-border/80 p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-gdp" />
            <h4 className="text-xs font-black text-foreground">
              احداث و بازسازی کارخانجات به تفکیک استان‌ها
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            ظرفیت آزاد ساخت:{" "}
            {PersianNumberFormatter.formatNumberWithCommas(totalEmptySlots)}{" "}
            اسلات
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pl-1">
          {ownedProvinces.map((prov) => {
            const empty = Math.max(0, prov.maxSlots - prov.factoriesCount);
            const cost = IndustryCalculator.FACTORY_REBUILD_COST;
            const canAfford = nation.treasury >= cost;
            const isRebuildingThis = rebuildingProvId === prov.provinceId;

            return (
              <div
                key={prov.provinceId}
                className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-foreground block truncate">
                    {prov.nameFa}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground block">
                    کارخانجات:{" "}
                    {PersianNumberFormatter.formatNumberWithCommas(
                      prov.factoriesCount,
                    )}{" "}
                    از{" "}
                    {PersianNumberFormatter.formatNumberWithCommas(
                      prov.maxSlots,
                    )}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {empty > 0 ? (
                    <button
                      onClick={() => handleRebuildFactory(prov.provinceId)}
                      disabled={!canAfford || rebuildingProvId !== null}
                      className="px-3 py-1.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1"
                    >
                      {isRebuildingThis ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Wrench size={12} />
                      )}
                      <span>
                        احداث (+۱) (
                        {PersianNumberFormatter.formatCurrency(cost, true)})
                      </span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                      تکمیل ظرفیت
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
