import React from "react";
import { Zap, ShieldAlert, Landmark, Flame, Globe2 } from "lucide-react";

interface AbilityItem {
  id: string;
  name: string;
  requiredGov: string;
  govLabel: string;
  desc: string;
  cooldown: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

const REGIME_ABILITIES: AbilityItem[] = [
  {
    id: "DIPLOMATIC_SUMMIT",
    name: "نشست دیپلماتیک",
    requiredGov: "DEMOCRACY",
    govLabel: "دموکراسی",
    desc: "افزایش فوری ۲0+ امتیاز نظر با یک کشور هدف و بهبود اعتبار جهانی.",
    cooldown: "۱۲ نوبت خنک‌سازی",
    icon: Globe2,
    color: "text-diplomacy",
  },
  {
    id: "MARTIAL_LAW",
    name: "اعلام حکومت نظامی",
    requiredGov: "DICTATORSHIP",
    govLabel: "دیکتاتوری",
    desc: "سرکوب ناآرامی‌ها و افزایش فوری ۱۵+ درصد ثبات داخلی کشور.",
    cooldown: "۲۰ نوبت خنک‌سازی",
    icon: ShieldAlert,
    color: "text-military",
  },
  {
    id: "INDUSTRIAL_MOBILIZATION",
    name: "بسیج صنعتی",
    requiredGov: "COMMUNISM",
    govLabel: "کمونیسم",
    desc: "افزایش ۵+ درصدی ضریب رشد اقتصاد به مدت ۵ نوبت با قربانی کردن بخشی از نیروی انسانی.",
    cooldown: "۲۵ نوبت خنک‌سازی",
    icon: Zap,
    color: "text-gdp",
  },
  {
    id: "WAR_ALERT",
    name: "هشدار جنگی",
    requiredGov: "FASCISM",
    govLabel: "فاشیسم",
    desc: "کاهش فوری ۳۰ واحدی فرسایش جنگی ارتش در خطوط مقدم نبرد.",
    cooldown: "۲۰ نوبت خنک‌سازی",
    icon: Flame,
    color: "text-treasury",
  },
  {
    id: "ROYAL_DECREE",
    name: "فرمان سلطنتی",
    requiredGov: "MONARCHY",
    govLabel: "پادشاهی",
    desc: "هزینه ۴۰,۰۰۰ از خزانه برای جهش فوری ۱۵ واحدی اعتبار جهانی کشور.",
    cooldown: "۲۰ نوبت خنک‌سازی",
    icon: Landmark,
    color: "text-amber-500",
  },
];

interface AbilitiesTabProps {
  currentGovernment: string;
}

export function AbilitiesTab({ currentGovernment }: AbilitiesTabProps) {
  const handleActivate = (ability: AbilityItem) => {
    if (ability.requiredGov !== currentGovernment) {
      alert(
        `خطا: این قابلیت اختصاصی رژیم '${ability.govLabel}' است. نظام سیاسی فعلی شما مطابقت ندارد.`,
      );
      return;
    }
    alert(
      `قابلیت راهبردی «${ability.name}» با موفقیت فعال شد و اثرات آن در نوبت بعدی اعمال خواهد شد.`,
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1">
        <Zap size={13} className="text-treasury" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          قابلیت‌ها و توانمندی‌های ویژه حکومتی
        </span>
      </div>

      <div className="space-y-3">
        {REGIME_ABILITIES.map((ab) => {
          const Icon = ab.icon;
          const isCompatible = ab.requiredGov === currentGovernment;

          return (
            <div
              key={ab.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 text-right ${
                isCompatible
                  ? "bg-background/60 border-primary/40 shadow-sm"
                  : "bg-background/20 border-border/40 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={ab.color} />
                  <span className="text-xs font-bold text-foreground">
                    {ab.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${isCompatible ? "bg-gdp/20 text-gdp font-bold" : "bg-secondary text-muted-foreground"}`}
                >
                  مختص: {ab.govLabel}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {ab.desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-[9px] font-mono text-muted-foreground">
                  {ab.cooldown}
                </span>
                <button
                  onClick={() => handleActivate(ab)}
                  disabled={!isCompatible}
                  className={`py-2 px-4 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                    isCompatible
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isCompatible ? "فعال‌سازی توانمندی" : "نیازمند تغییر رژیم"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
