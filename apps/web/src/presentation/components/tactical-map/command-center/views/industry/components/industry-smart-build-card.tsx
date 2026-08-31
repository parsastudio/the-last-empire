import React from "react";
import {
  Layers,
  BarChart3,
  Coins,
  Loader2,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { Province } from "@/domain/province/province.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface IndustrySmartBuildCardProps {
  ownedProvinces: Province[];
  totalEmptySlots: number;
  fixedBatchCount: number;
  unitsToBuild: number;
  batchTotalCost: number;
  canAffordBatch: boolean;
  isBatchBuilding: boolean;
  onSmartBatchBuild: () => void;
}

export function IndustrySmartBuildCard({
  ownedProvinces,
  totalEmptySlots,
  fixedBatchCount,
  unitsToBuild,
  batchTotalCost,
  canAffordBatch,
  isBatchBuilding,
  onSmartBatchBuild,
}: IndustrySmartBuildCardProps) {
  return (
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
              سیستم با هر کلیک، ۱۰٪ از بودجه خزانه را به احداث در کم‌توسعه‌ترین
              استان‌ها تخصیص می‌دهد.
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
                {PersianNumberFormatter.formatNumberWithCommas(fixedBatchCount)}{" "}
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
              <span className="font-sans text-[11px]">مبلغ سرمایه‌گذاری:</span>
              <span className="font-black text-sm">
                {PersianNumberFormatter.formatCurrency(batchTotalCost, true)}
              </span>
            </div>
          </div>

          <button
            onClick={onSmartBatchBuild}
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
  );
}
