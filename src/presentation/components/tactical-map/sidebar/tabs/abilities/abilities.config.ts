import React from "react";
import { Zap, ShieldAlert, Landmark, Flame, Globe2 } from "lucide-react";

export interface AbilityItem {
  id: string;
  name: string;
  requiredGov: string;
  govLabel: string;
  desc: string;
  cooldown: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

export const REGIME_ABILITIES: AbilityItem[] = [
  {
    id: "DIPLOMATIC_SUMMIT",
    name: "نشست دیپلماتیک",
    requiredGov: "DEMOCRACY",
    govLabel: "دموکراسی",
    desc: "افزایش فوری ۲۰+ امتیاز نظر با یک کشور هدف و بهبود اعتبار جهانی.",
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
    name: "هشدار امنیتی ارتش",
    requiredGov: "FASCISM",
    govLabel: "فاشیسم",
    desc: "کاهش فوری ۳۰ واحدی فرسایش ساختاری ارتش و نیروها.",
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
