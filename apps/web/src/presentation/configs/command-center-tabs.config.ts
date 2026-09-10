import {
  LayoutDashboard,
  Swords,
  Factory,
  Rocket,
  Landmark,
  FileText,
  Users,
  Binary,
  LucideIcon,
} from "lucide-react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";

export interface CommandCenterTabConfig {
  id: SidebarTabType;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  getTitle: (nationName: string) => string;
  subtitle: string;
}

export const COMMAND_CENTER_TABS_CONFIG: Record<
  SidebarTabType,
  CommandCenterTabConfig
> = {
  overview: {
    id: "overview",
    label: "نمای کلی وضعیت",
    shortLabel: "نما",
    icon: LayoutDashboard,
    getTitle: (nationName) => `نمای کلی وضعیت ${nationName}`,
    subtitle: "",
  },
  military: {
    id: "military",
    label: "ارتش و تسلیحات",
    shortLabel: "ارتش و تسلیحات",
    icon: Swords,
    getTitle: () => "ستاد کل نیروهای مسلح و صنایع دفاعی",
    subtitle: "",
  },
  industry: {
    id: "industry",
    label: "صنایع و تولید",
    shortLabel: "صنایع و تولید",
    icon: Factory,
    getTitle: () => "وزارت صنایع، نوسازی و بازار ماشین‌آلات",
    subtitle: "",
  },
  projects: {
    id: "projects",
    label: "برنامه‌های ملی",
    shortLabel: "برنامه‌های ملی",
    icon: Rocket,
    getTitle: () => "سازمان ملی پژوهش‌ها و برنامه‌های راهبردی",
    subtitle: "",
  },
  politics: {
    id: "politics",
    label: "دیوان سیاست",
    shortLabel: "دیوان سیاست",
    icon: Landmark,
    getTitle: () => "دیوان عالی سیاست و دکترین مالی",
    subtitle: "",
  },
  espionage: {
    id: "espionage",
    label: "سرویس اطلاعات و جاسوسی",
    shortLabel: "سرویس اطلاعات",
    icon: Binary,
    getTitle: () => "دایره عملیات ویژه و سرویس اطلاعاتی",
    subtitle: "",
  },
  reports: {
    id: "reports",
    label: "گزارش‌های نبرد و حاکمیت",
    shortLabel: "گزارش‌ها",
    icon: FileText,
    getTitle: () => "بایگانی گزارش‌های اطلاعاتی و حاکمیت",
    subtitle: "",
  },
  diplomacy: {
    id: "diplomacy",
    label: "دیپلماسی و روابط خارجی",
    shortLabel: "دیپلماسی",
    icon: Users,
    getTitle: () => "وزارت امور خارجه و دیپلماسی",
    subtitle: "",
  },
};

export const COMMAND_RAIL_TABS: {
  id: SidebarTabType;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "overview", label: "نما", icon: LayoutDashboard },
  { id: "military", label: "ارتش و تسلیحات", icon: Swords },
  { id: "industry", label: "صنایع و تولید", icon: Factory },
  { id: "projects", label: "برنامه‌های ملی", icon: Rocket },
  { id: "politics", label: "سیاست", icon: Landmark },
  { id: "espionage", label: "جاسوسی", icon: Binary },
  { id: "reports", label: "گزارش‌ها", icon: FileText },
  { id: "diplomacy", label: "دیپلماسی", icon: Users },
];
