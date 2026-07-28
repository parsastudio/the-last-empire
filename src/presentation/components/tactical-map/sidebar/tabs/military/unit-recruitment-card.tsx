import React from "react";
import { Clock, Coins, Users, Wrench } from "lucide-react";
import { UnitConfig } from "./recruitable-units.config";

interface UnitRecruitmentCardProps {
  unit: UnitConfig;
  quantity: number;
  onQuantityChange: (type: string, delta: number) => void;
  onRecruit: (unit: UnitConfig) => void;
}

export function UnitRecruitmentCard({
  unit,
  quantity,
  onQuantityChange,
  onRecruit,
}: UnitRecruitmentCardProps) {
  const Icon = unit.icon;
  const totalMoney = unit.moneyCost * quantity;

  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={15} className={unit.color} />
          <span className="text-xs font-bold text-foreground">{unit.name}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-lg">
          <Clock size={11} className="text-treasury" />
          <span>{unit.buildTurns} نوبت ساخت</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Coins size={11} className="text-gdp" />
          <span>هزینه: ${totalMoney.toLocaleString()}</span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Users size={11} className="text-primary" />
          <span>نیروی انسانی: {unit.manpowerCost * quantity}</span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Wrench size={11} className="text-treasury" />
          <span>فولاد: {unit.steelCost * quantity} تن</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-muted-foreground text-[10px]">
            تعداد سفارش:
          </span>
          <button
            onClick={() => onQuantityChange(unit.type, -1)}
            className="w-6 h-6 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center font-bold text-foreground cursor-pointer"
          >
            -
          </button>
          <span className="font-bold w-6 text-center text-foreground">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(unit.type, 1)}
            className="w-6 h-6 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center font-bold text-foreground cursor-pointer"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onRecruit(unit)}
          className="py-2 px-4 bg-military hover:bg-military/90 text-primary-foreground rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer"
        >
          ثبت سفارش ساخت
        </button>
      </div>
    </div>
  );
}
