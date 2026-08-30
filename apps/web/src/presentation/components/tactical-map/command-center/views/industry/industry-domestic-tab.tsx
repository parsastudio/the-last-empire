"use client";

import React, { useState, useRef } from "react";
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
  BarChart3,
  Coins,
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
  const [isBatchBuilding, setIsBatchBuilding] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const initialTreasuryRef = useRef<number>(nation.treasury);

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

  const factoryCost = IndustryCalculator.FACTORY_REBUILD_COST;
  const initialTenPercentBudget = Math.floor(initialTreasuryRef.current * 0.1);
  const fixedBatchCount = Math.max(
    1,
    Math.floor(initialTenPercentBudget / factoryCost),
  );

  const affordableUnits = Math.floor(nation.treasury / factoryCost);
  const unitsToBuild = Math.min(
    fixedBatchCount,
    totalEmptySlots,
    affordableUnits,
  );
  const batchTotalCost = unitsToBuild * factoryCost;
  const canAffordBatch = unitsToBuild > 0 && nation.treasury >= batchTotalCost;

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
        "تمامی خطوط تولید کارخانجات کشور به آخرین فناوری بومی مجهز شدند.",
      );
    } finally {
      setIsModernizing(false);
    }
  };

  const handleSmartBatchBuild = async () => {
    if (isBatchBuilding || !canAffordBatch || unitsToBuild <= 0) return;
    setIsBatchBuilding(true);

    try {
      const workingProvs = ownedProvinces.map((p) => ({ ...p }));
      const actionsToRun: Array<{ nationId: string; provinceId: number }> = [];

      for (let i = 0; i < unitsToBuild; i++) {
        const available = workingProvs.filter(
          (p) => p.factoriesCount < p.maxSlots,
        );
        if (available.length === 0) break;

        available.sort((a, b) => {
          const ratioA = a.maxSlots > 0 ? a.factoriesCount / a.maxSlots : 1;
          const ratioB = b.maxSlots > 0 ? b.factoriesCount / b.maxSlots : 1;
          if (ratioA !== ratioB) return ratioA - ratioB;
          if (a.factoriesCount !== b.factoriesCount)
            return a.factoriesCount - b.factoriesCount;
          return a.provinceId - b.provinceId;
        });

        const target = available[0]!;
        actionsToRun.push({
          nationId: nation.id,
          provinceId: target.provinceId,
        });
        target.factoriesCount += 1;
      }

      for (const item of actionsToRun) {
        const action = ActionFactory.buildFactory(
          item.nationId,
          item.provinceId,
        );
        await dispatchAction(action);
      }
    } finally {
      setIsBatchBuilding(false);
    }
  };

  const factoryYield = IndustryCalculator.calculateFactoryYield(
    nation.equipmentTechLevel,
  );
  const nationalIndustrialOccupancy =
    totalMaxSlots > 0
      ? Math.round((totalActiveFactories / totalMaxSlots) * 100)
      : 100;

  return (
    <div className="space-y-6 dir-rtl text-right font-sans animate-in fade-in duration-200">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
            <Factory size={14} className="text-gdp" />
            <span>سوله‌های فعال صنعتی</span>
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black font-mono text-foreground">
              {PersianNumberFormatter.formatNumberWithCommas(
                totalActiveFactories,
              )}
              <span className="text-xs text-muted-foreground font-normal mr-1">
                / {PersianNumberFormatter.formatNumberWithCommas(totalMaxSlots)}
              </span>
            </span>
            <span className="text-xs font-mono font-bold text-gdp">
              {PersianNumberFormatter.toPersianDigits(
                nationalIndustrialOccupancy,
              )}
              ٪
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gdp rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, nationalIndustrialOccupancy)}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>ارزش افزوده هر کارخانه</span>
          </span>
          <span className="text-lg font-black font-mono text-emerald-400 block pt-1">
            {PersianNumberFormatter.formatCurrency(factoryYield, true)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block">
            درآمد تضمینی پایدار در هر نوبت
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
            <Cpu size={14} className="text-primary" />
            <span>دانش و پژوهش بومی (R&D)</span>
          </span>
          <span className="text-lg font-black font-mono text-primary block pt-1">
            سطح{" "}
            {PersianNumberFormatter.toPersianDigits(
              nation.industrialLevel.toFixed(1),
            )}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block">
            سقف ساخت ادوات در داخل کشور
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
            <Hammer size={14} className="text-gdp" />
            <span>تراز تجهیزات خطوط تولید</span>
          </span>
          <span className="text-lg font-black font-mono text-gdp block pt-1">
            سطح{" "}
            {PersianNumberFormatter.toPersianDigits(
              nation.equipmentTechLevel.toFixed(1),
            )}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block">
            کیفیت ابزارآلات و ماشین‌آلات نصب‌شده
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndustryTechUpgradeCard
          nationId={nation.id}
          treasury={nation.treasury}
          industrialLevel={nation.industrialLevel}
        />

        <div className="bg-card/90 border border-border/80 p-5 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-primary/15 text-primary border border-primary/30">
                  <Hammer size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground">
                    نوسازی سراسری خطوط تولید
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    تجهیز تمام کارخانه‌ها تا سقف آخرین لول دانش بومی
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded-lg">
                {canModernize ? "نیازمند به‌روزرسانی" : "کاملاً مدرن"}
              </span>
            </div>

            <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-sans">
                  کارخانجات هدف نوسازی:
                </span>
                <span className="font-bold text-foreground">
                  {PersianNumberFormatter.formatNumberWithCommas(
                    totalActiveFactories,
                  )}{" "}
                  واحد
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border/40">
                <span className="text-muted-foreground font-sans">
                  مجموع هزینه نوسازی:
                </span>
                <span className="font-extrabold text-foreground">
                  {canModernize
                    ? PersianNumberFormatter.formatCurrency(modernizeCost, true)
                    : "صفر (مجهز به بالاترین فناوری)"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleModernizeAll}
            disabled={!canModernize || !canAffordModernize || isModernizing}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isModernizing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : canModernize ? (
              <Sparkles size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>
              {isModernizing
                ? "در حال نوسازی سراسری خطوط تولید..."
                : !canModernize
                  ? "تمام کارخانجات مجهز به حداکثر توان علمی هستند"
                  : !canAffordModernize
                    ? "موجودی خزانه جهت نوسازی کافی نیست"
                    : `نوسازی کلیه خطوط تولید (${PersianNumberFormatter.formatCurrency(modernizeCost, true)})`}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-card/90 border border-border/80 p-6 rounded-3xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gdp/15 text-gdp border border-gdp/30">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                احداث و توسعه هوشمند کارخانجات ملی
              </h3>
              <p className="text-[11px] text-muted-foreground">
                سیستم با هر کلیک، ۱۰٪ از بودجه خزانه را به احداث در
                کم‌توسعه‌ترین استان‌ها تخصیص می‌دهد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted-foreground font-sans text-[11px]">
              ظرفیت آزاد ساخت:
            </span>
            <span className="font-black text-foreground bg-secondary/80 border border-border px-3 py-1 rounded-xl">
              {PersianNumberFormatter.formatNumberWithCommas(totalEmptySlots)}{" "}
              سوله
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
          <div className="lg:col-span-2 bg-secondary/30 border border-border/60 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <BarChart3 size={14} className="text-gdp" />
                <span>پایش توازن صنعتی استان‌ها</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-normal font-mono">
                {PersianNumberFormatter.formatNumberWithCommas(
                  ownedProvinces.length,
                )}{" "}
                استان تحت حاکمیت
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pl-1">
              {ownedProvinces.map((prov) => {
                const ratio =
                  prov.maxSlots > 0
                    ? Math.round((prov.factoriesCount / prov.maxSlots) * 100)
                    : 100;
                const isFull = prov.factoriesCount >= prov.maxSlots;

                return (
                  <div
                    key={prov.provinceId}
                    className="p-2.5 rounded-xl bg-background/60 border border-border/50 space-y-1 text-[11px]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground truncate max-w-[100px]">
                        {prov.nameFa}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold ${isFull ? "text-emerald-400" : "text-gdp"}`}
                      >
                        {PersianNumberFormatter.toPersianDigits(ratio)}٪
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isFull ? "bg-emerald-400" : "bg-gdp"}`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                      <span>
                        {PersianNumberFormatter.formatNumberWithCommas(
                          prov.factoriesCount,
                        )}{" "}
                        فعال
                      </span>
                      <span>
                        {PersianNumberFormatter.formatNumberWithCommas(
                          prov.maxSlots,
                        )}{" "}
                        سقف
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-4 rounded-2xl space-y-3 font-mono text-xs flex flex-col justify-between h-full">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-muted-foreground font-sans text-[11px]">
                <span className="flex items-center gap-1">
                  <Coins size={13} className="text-gdp" />
                  <span>بسته احداث (۱۰٪ خزانه):</span>
                </span>
                <span className="font-bold text-foreground">
                  {PersianNumberFormatter.formatNumberWithCommas(
                    fixedBatchCount,
                  )}{" "}
                  سوله
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground font-sans text-[11px]">
                <span>تعداد قابل احداث در این گام:</span>
                <span className="font-black text-gdp">
                  {PersianNumberFormatter.formatNumberWithCommas(unitsToBuild)}{" "}
                  سوله
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-foreground">
                <span className="font-sans text-[11px]">
                  مبلغ سرمایه‌گذاری:
                </span>
                <span className="font-black text-sm">
                  {PersianNumberFormatter.formatCurrency(batchTotalCost, true)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSmartBatchBuild}
              disabled={
                !canAffordBatch || isBatchBuilding || totalEmptySlots === 0
              }
              className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xl shadow-gdp/20 flex items-center justify-center gap-2"
            >
              {isBatchBuilding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : totalEmptySlots === 0 ? (
                <CheckCircle2 size={16} />
              ) : (
                <Wrench size={16} />
              )}
              <span>
                {isBatchBuilding
                  ? "در حال احداث متوازن سوله‌ها در سراسر کشور..."
                  : totalEmptySlots === 0
                    ? "تمام استان‌ها به سقف نهایی کارخانجات رسیده‌اند"
                    : !canAffordBatch
                      ? "موجودی خزانه برای گام بعدی کافی نیست"
                      : `احداث هوشمند ${PersianNumberFormatter.formatNumberWithCommas(unitsToBuild)} کارخانه (${PersianNumberFormatter.formatCurrency(batchTotalCost, true)})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
