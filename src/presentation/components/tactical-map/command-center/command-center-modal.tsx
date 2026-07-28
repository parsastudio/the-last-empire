import React from "react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { CommandCenterTabRouter } from "./command-center-tab-router";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

interface CommandCenterModalProps {
  activeTab: SidebarTabType | null;
  selectedTargetCode?: string | null;
  nation: Nation | null;
  gameState?: GameState | null;
  reports: CombatReport[];
  onClose: () => void;
  onFocusCountry?: (code: string) => void;
  onSelectReport: (report: CombatReport) => void;
  onOpenTrade: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
}

export function CommandCenterModal({
  activeTab,
  selectedTargetCode,
  nation,
  gameState,
  reports,
  onClose,
  onFocusCountry,
  onOpenTrade,
}: CommandCenterModalProps) {
  if (!activeTab || !nation) return null;

  const getTitleAndSubtitle = () => {
    switch (activeTab) {
      case "overview":
        return {
          title: `شناسنامه و وضعیت عمومی ${nation.name}`,
          subtitle: "پایش زنده اقتصاد، جمعیت، منابع و پایداری داخلی کشور",
        };
      case "market":
        return {
          title: "بورس بین‌المللی انرژی و فولاد",
          subtitle: "پایش قیمت‌های جهانی و انجام معاملات کلان منابع استراتژیک",
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
      case "diplomacy":
        return {
          title: "وزارت امور خارجه و دیپلماسی",
          subtitle: "روابط بین‌المللی، معاهدات دفاعی، حق عبور و مطالبه باج",
        };
      case "research":
        return {
          title: "پژوهشکده دکترین‌های راهبردی",
          subtitle: "توسعه شاخه‌های صنعتی، ناهمگون نظامی و هژمونی بین‌المللی",
        };
      case "abilities":
        return {
          title: "فرمان‌های ویژه حکومتی",
          subtitle: "فعال‌سازی توانمندی‌های منحصر‌به‌فرد نظام سیاسی حاکم",
        };
      case "reports":
        return {
          title: "بایگانی گزارش‌های اطلاعاتی و نبرد",
          subtitle: "ارزیابی نتایج عملیات‌های نظامی و آمار تلفات",
        };
      default:
        return { title: "اتاق فرماندهی", subtitle: "" };
    }
  };

  const meta = getTitleAndSubtitle();

  return (
    <UnifiedModalShell
      isOpen={activeTab !== null}
      title={meta.title}
      subtitle={meta.subtitle}
      maxWidthClass="max-w-6xl"
      onClose={onClose}
    >
      <CommandCenterTabRouter
        activeTab={activeTab}
        selectedTargetCode={selectedTargetCode}
        nation={nation}
        gameState={gameState}
        reports={reports}
        onFocusCountry={onFocusCountry}
        onOpenTrade={onOpenTrade}
      />
    </UnifiedModalShell>
  );
}
