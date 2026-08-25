import React, { useState } from "react";
import {
  Swords,
  Zap,
  Shield,
  ShieldAlert,
  Crosshair,
  Plane,
  Radio,
  Anchor,
  Lock,
} from "lucide-react";
import { MILITARY_UNIT_STATS, UnitType } from "@geopolitics/domain";
import { BatchUnitRecruitModal } from "./batch-unit-recruit-modal";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface MilitaryExpansionViewProps {
  nationId: string;
  treasury?: number;
  techLevel?: number;
  industrialLevel?: number;
}

const UNIT_PREVIEWS: {
  type: UnitType;
  icon: React.ElementType;
  color: string;
}[] = [
  { type: "INFANTRY", icon: Shield, color: "text-primary" },
  { type: "DRONE_MISSILE", icon: Radio, color: "text-treasury" },
  { type: "ARMOR", icon: ShieldAlert, color: "text-military" },
  { type: "AIR_DEFENSE", icon: Crosshair, color: "text-diplomacy" },
  { type: "AIR_FORCE", icon: Plane, color: "text-gdp" },
  { type: "NAVAL_FLEET", icon: Anchor, color: "text-primary" },
];

export function MilitaryExpansionView({
  nationId,
  treasury = 100000,
  techLevel = 1,
  industrialLevel = 1,
}: MilitaryExpansionViewProps) {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right pt-3 border-t border-border/50 font-sans">
      <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-5 rounded-3xl space-y-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-gdp/60 via-primary/40 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gdp/15 border border-gdp/30 text-gdp flex items-center justify-center shadow-lg shadow-gdp/10 shrink-0">
              <Swords size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                ستاد جامع ساخت و توسعه صنایع دفاعی
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 font-medium">
                سفارش همزمان و یکپارچه پیاده‌نظام، زرهی، پدافند هوایی،
                جنگنده‌ها، موشک‌ها و ناوگان دریایی با گام‌های ۵٪ خزانه.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="py-3.5 px-6 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-black text-xs transition-all shadow-xl shadow-gdp/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 border border-gdp/30 shrink-0 whitespace-nowrap"
          >
            <Zap size={16} />
            <span>ورود به کارخانه و ساخت تسلیحات</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-border/40 font-mono">
          {UNIT_PREVIEWS.map((item) => {
            const stat = MILITARY_UNIT_STATS[item.type];
            const Icon = item.icon;
            const isUnlocked = techLevel >= stat.requiredTechLevel;

            return (
              <div
                key={item.type}
                className={`p-2.5 rounded-2xl border text-right space-y-1 ${
                  isUnlocked
                    ? "bg-background/50 border-border/60"
                    : "bg-background/20 border-border/30 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={14} className={item.color} />
                  {!isUnlocked ? (
                    <span className="text-[9px] text-amber-500 flex items-center gap-0.5">
                      <Lock size={9} />
                      سطح{" "}
                      {PersianNumberFormatter.toPersianDigits(
                        stat.requiredTechLevel,
                      )}
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-sans">
                      آماده تولید
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-foreground block truncate font-sans">
                  {stat.nameFa}
                </span>
                <span className="text-[9px] text-muted-foreground block">
                  {PersianNumberFormatter.toPersianDigits(stat.buildTurns)} نوبت
                  ساخت
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <BatchUnitRecruitModal
        isOpen={isBatchModalOpen}
        nationId={nationId}
        treasury={treasury}
        techLevel={techLevel}
        industrialLevel={industrialLevel}
        onClose={() => setIsBatchModalOpen(false)}
      />
    </div>
  );
}
