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
    getTitle: () => "ستاد کل نیروهای مسلح، صنایع دفاعی و بازار هم‌پیمانان",
    subtitle:
      "مدیریت یگان‌ها، ساخت بومی تحویل فوری و واردات تسلیحاتی با قیمت متغیر بر اساس سطح فناوری",
  },
  industry: {
    id: "industry",
    label: "صنایع و تولید",
    shortLabel: "صنایع و تولید",
    icon: Factory,
    getTitle: () => "وزارت صنایع و معادن، نوسازی و بازار ماشین‌آلات",
    subtitle:
      "احداث و بازسازی کارخانجات، ارتقای خطوط تولید و واردات تجهیزات صنعتی",
  },
  projects: {
    id: "projects",
    label: "برنامه‌های ملی",
    shortLabel: "برنامه‌های ملی",
    icon: Rocket,
    getTitle: () => "سازمان ملی پژوهش‌ها و برنامه‌های راهبردی کشور",
    subtitle:
      "پیشبرد گام‌به‌گام پروژه‌های تمدنی (تزریق بودجه حداکثر به ۲ پروژه در هر نوبت)",
  },
  politics: {
    id: "politics",
    label: "دیوان سیاست",
    shortLabel: "دیوان سیاست",
    icon: Landmark,
    getTitle: () => "دیوان عالی سیاست، دکترین مالی و قوانین",
    subtitle:
      "تنظیم دکترین اقتصاد ملی و ترانزیت، تسهیلات بین‌المللی و تغییر رژیم",
  },
  espionage: {
    id: "espionage",
    label: "سرویس اطلاعات و جاسوسی",
    shortLabel: "سرویس اطلاعات",
    icon: Binary,
    getTitle: () => "دایره عملیات ویژه و سرویس اطلاعاتی",
    subtitle:
      "شنود ماهواره‌ای زرادخانه، خرابکاری در پدافند دشمن و سرقت فوق‌محرمانه فناوری",
  },
  reports: {
    id: "reports",
    label: "گزارش‌های نبرد و حاکمیت",
    shortLabel: "گزارش‌ها",
    icon: FileText,
    getTitle: () => "بایگانی گزارش‌های اطلاعاتی و حاکمیت",
    subtitle: "ارزیابی رویدادهای ملی و گزارش‌های پایش وضعیت",
  },
  diplomacy: {
    id: "diplomacy",
    label: "دیپلماسی و روابط خارجی",
    shortLabel: "دیپلماسی",
    icon: Users,
    getTitle: () => "وزارت امور خارجه و دیپلماسی",
    subtitle: "روابط بین‌المللی، معاهدات دفاعی و ائتلاف‌های استراتژیک",
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
