import {
  LayoutDashboard,
  Swords,
  Factory,
  Landmark,
  Globe2,
  Eye,
  FileText,
  LucideIcon,
} from "lucide-react";

export type SidebarTabType =
  | "overview"
  | "military"
  | "industry"
  | "politics"
  | "diplomacy"
  | "espionage"
  | "reports";

export interface SidebarTabItem {
  id: SidebarTabType;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

export const SIDEBAR_TABS_CONFIG: SidebarTabItem[] = [
  {
    id: "overview",
    label: "بررسی کلان",
    icon: LayoutDashboard,
    colorClass: "text-foreground",
  },
  {
    id: "military",
    label: "امور نظامی",
    icon: Swords,
    colorClass: "text-military",
  },
  {
    id: "industry",
    label: "صنایع و تولید",
    icon: Factory,
    colorClass: "text-gdp",
  },
  {
    id: "politics",
    label: "سیاست و اقتصاد",
    icon: Landmark,
    colorClass: "text-primary",
  },
  {
    id: "diplomacy",
    label: "دیپلماسی",
    icon: Globe2,
    colorClass: "text-diplomacy",
  },
  {
    id: "espionage",
    label: "اطلاعات و امنیت",
    icon: Eye,
    colorClass: "text-treasury",
  },
  {
    id: "reports",
    label: "گزارش‌های نبرد",
    icon: FileText,
    colorClass: "text-foreground",
  },
];
