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
        title: `شناسنامه و وضعیت عمومی ${nationName}`,
        subtitle: "پایش زنده اقتصاد، جمعیت، منابع و پایداری داخلی کشور",
      };
    case "military":
      return {
        title: "ستاد کل نیروهای مسلح و تسلیحات",
        subtitle: "مدیریت یگان‌ها، صف ساخت، انحلال و ارتقای سطح فناوری دفاعی",
      };
    case "politics":
      return {
        title: "دیوان عالی سیاست و قوانین",
        subtitle: "تنظیم مالیات، تعرفه‌ها، وام‌های بین‌المللی و تغییر رژیم",
      };
    case "proxy":
      return {
        title: "مرکز عملیات‌های نیابتی و جنگ نفوذ",
        subtitle:
          "مدیریت عملیات پنهان، بودجه‌دهی نیابتی و پایش تخریب ثبات دشمنان",
      };
    case "diplomacy":
      return {
        title: "وزارت امور خارجه و دیپلماسی",
        subtitle: "روابط بین‌المللی، معاهدات دفاعی و ائتلاف‌های استراتژیک",
      };
    case "research":
      return {
        title: "پژوهشکده دکترین‌های راهبردی",
        subtitle: "توسعه شاخه‌های صنعتی و هژمونی بین‌المللی",
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
