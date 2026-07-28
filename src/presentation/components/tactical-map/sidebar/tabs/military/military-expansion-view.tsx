import React, { useState } from "react";
import {
  Swords,
  Shield,
  Plane,
  Radio,
  Clock,
  Coins,
  Users,
  Wrench,
} from "lucide-react";

interface UnitConfig {
  type: string;
  name: string;
  moneyCost: number;
  manpowerCost: number;
  steelCost: number;
  buildTurns: number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

const RECRUITABLE_UNITS: UnitConfig[] = [
  {
    type: "INFANTRY",
    name: "پیاده‌نظام رزمی (۱۰ هزار نفر)",
    moneyCost: 100,
    manpowerCost: 10,
    steelCost: 0,
    buildTurns: 2,
    icon: Shield,
    color: "text-primary",
  },
  {
    type: "AIR_FORCE",
    name: "نیروی هوایی (۱۰ فروند جنگنده)",
    moneyCost: 500,
    manpowerCost: 5,
    steelCost: 20,
    buildTurns: 4,
    icon: Plane,
    color: "text-gdp",
  },
  {
    type: "DRONE_MISSILE",
    name: "یگان موشکی و پهپادی (۱۰ یگان)",
    moneyCost: 1200,
    manpowerCost: 1,
    steelCost: 25,
    buildTurns: 1,
    icon: Radio,
    color: "text-treasury",
  },
];

export function MilitaryExpansionView() {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    INFANTRY: 1,
    AIR_FORCE: 1,
    DRONE_MISSILE: 1,
  });

  const handleQuantityChange = (type: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[type] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [type]: next };
    });
  };

  const handleRecruit = (unit: UnitConfig) => {
    const qty = quantities[unit.type] || 1;
    const totalMoney = unit.moneyCost * qty;
    const totalManpower = unit.manpowerCost * qty;
    const totalSteel = unit.steelCost * qty;

    alert(
      `سفارش استخدام موفق:\n- نوع یگان: ${unit.name}\n- تعداد: ${qty}\n- هزینه مالی: $${totalMoney.toLocaleString()}\n- نیروی انسانی: ${totalManpower} هزار\n- فولاد مورد نیاز: ${totalSteel} تن\n- زمان آمادگی: ${unit.buildTurns} نوبت دیگر`,
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1">
        <Swords size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          گسترش و استخدام نیروی نظامی
        </span>
      </div>

      <div className="space-y-3">
        {RECRUITABLE_UNITS.map((unit) => {
          const Icon = unit.icon;
          const qty = quantities[unit.type] || 1;
          const totalMoney = unit.moneyCost * qty;

          return (
            <div
              key={unit.type}
              className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={15} className={unit.color} />
                  <span className="text-xs font-bold text-foreground">
                    {unit.name}
                  </span>
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
                  <span>نیروی انسانی: {unit.manpowerCost * qty}</span>
                </div>
                <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
                  <Wrench size={11} className="text-treasury" />
                  <span>فولاد: {unit.steelCost * qty} تن</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-muted-foreground text-[10px]">
                    تعداد سفارش:
                  </span>
                  <button
                    onClick={() => handleQuantityChange(unit.type, -1)}
                    className="w-6 h-6 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center font-bold text-foreground cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold w-6 text-center text-foreground">
                    {qty}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(unit.type, 1)}
                    className="w-6 h-6 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center font-bold text-foreground cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleRecruit(unit)}
                  className="py-2 px-4 bg-military hover:bg-military/90 text-primary-foreground rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                >
                  ثبت سفارش ساخت
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
