import React from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { CommandCenterTabRouter } from "@/presentation/components/tactical-map/command-center/command-center-tab-router";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { CommandBreadcrumb } from "@/presentation/components/tactical-map/navigation/command-breadcrumb";

export interface CommandCenterMeta {
  title: string;
  subtitle: string;
}

export function getCommandCenterMeta(
  activeTab: SidebarTabType | null,
  nationName: string,
): CommandCenterMeta {
  switch (activeTab) {
    case "overview":
      return {
        title: `نمای کلی وضعیت ${nationName}`,
        subtitle: "",
      };
    case "military":
      return {
        title: "ستاد کل نیروهای مسلح، صنایع دفاعی و بازار هم‌پیمانان",
        subtitle:
          "مدیریت یگان‌ها، ساخت بومی تحویل فوری و واردات تسلیحاتی با قیمت متغیر بر اساس سطح فناوری",
      };
    case "industry":
      return {
        title: "وزارت صنایع و معادن، نوسازی و بازار ماشین‌آلات",
        subtitle:
          "احداث و بازسازی کارخانجات، ارتقای خطوط تولید و واردات تجهیزات صنعتی",
      };
    case "projects":
      return {
        title: "سازمان ملی پژوهش‌ها و برنامه‌های راهبردی کشور",
        subtitle:
          "پیشبرد گام‌به‌گام پروژه‌های تمدنی (تزریق بودجه حداکثر به ۲ پروژه در هر نوبت)",
      };
    case "politics":
      return {
        title: "دیوان عالی سیاست، دکترین مالی و قوانین",
        subtitle:
          "تنظیم دکترین اقتصاد ملی و ترانزیت، تسهیلات بین‌المللی و تغییر رژیم",
      };
    case "espionage":
      return {
        title: "دایره عملیات ویژه و سرویس اطلاعاتی",
        subtitle:
          "شنود ماهواره‌ای زرادخانه، خرابکاری در پدافند دشمن و سرقت فوق‌محرمانه فناوری",
      };
    case "diplomacy":
      return {
        title: "وزارت امور خارجه و دیپلماسی",
        subtitle: "روابط بین‌المللی، معاهدات دفاعی و ائتلاف‌های استراتژیک",
      };
    case "reports":
      return {
        title: "بایگانی گزارش‌های اطلاعاتی و حاکمیت",
        subtitle: "ارزیابی رویدادهای ملی و گزارش‌های پایش وضعیت",
      };
    default:
      return { title: "اتاق فرماندهی", subtitle: "" };
  }
}

interface CommandCenterModalProps {
  activeTab: SidebarTabType | null;
  activeSubTab?: string | null;
  selectedTargetCode?: string | null;
  nation: Nation | null;
  gameState?: GameState | null;
  onClose: () => void;
  onNavigateTab: (
    tab: SidebarTabType,
    subTab?: string,
    targetCode?: string,
  ) => void;
  onFocusCountry?: (code: string) => void;
}

export function CommandCenterModal({
  activeTab,
  activeSubTab,
  selectedTargetCode,
  nation,
  gameState,
  onClose,
  onNavigateTab,
  onFocusCountry,
}: CommandCenterModalProps) {
  if (!activeTab || !nation) return null;

  const meta = getCommandCenterMeta(activeTab, nation.name);

  return (
    <UnifiedModalShell
      isOpen={activeTab !== null}
      title={meta.title}
      subtitle={meta.subtitle}
      maxWidthClass="max-w-6xl"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="pb-2 text-right dir-rtl border-b border-border/40">
          <CommandBreadcrumb
            activeTab={activeTab}
            subTabLabel={activeSubTab}
            targetName={selectedTargetCode}
            onNavigateTab={onNavigateTab}
          />
        </div>

        <CommandCenterTabRouter
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          selectedTargetCode={selectedTargetCode}
          nation={nation}
          gameState={gameState}
          onFocusCountry={onFocusCountry}
          onNavigateTab={onNavigateTab}
        />
      </div>
    </UnifiedModalShell>
  );
}
