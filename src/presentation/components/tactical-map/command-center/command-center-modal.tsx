import React from "react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { CommandCenterHeader } from "./command-center-header";
import { WideOverviewView } from "./views/wide-overview-view";
import { WideMarketView } from "./views/wide-market-view";
import { WideMilitaryView } from "./views/wide-military-view";
import { WidePoliticsView } from "./views/wide-politics-view";
import { WideDiplomacyView } from "./views/wide-diplomacy-view";
import { WideResearchView } from "./views/wide-research-view";
import { WideAbilitiesView } from "./views/wide-abilities-view";
import { WideReportsView } from "./views/wide-reports-view";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";

interface CommandCenterModalProps {
  activeTab: SidebarTabType | null;
  selectedTargetCode?: string | null;
  nation: Nation | null;
  mockReports: CombatReport[];
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
  mockReports,
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
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-smooth cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card/95 border border-border w-[88vw] h-[85vh] max-w-6xl rounded-3xl p-6 shadow-2xl flex flex-col space-y-5 dir-rtl overflow-hidden text-foreground backdrop-blur-md cursor-default"
      >
        <CommandCenterHeader
          title={meta.title}
          subtitle={meta.subtitle}
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {activeTab === "overview" && <WideOverviewView nation={nation} />}

          {activeTab === "market" && (
            <WideMarketView onOpenTrade={onOpenTrade} />
          )}

          {activeTab === "military" && (
            <WideMilitaryView military={nation.military} />
          )}

          {activeTab === "politics" && (
            <WidePoliticsView
              taxRate={nation.taxRate}
              governmentType={nation.government.type}
            />
          )}

          {activeTab === "diplomacy" && (
            <WideDiplomacyView
              selectedTargetCode={selectedTargetCode}
              onFocusCountry={onFocusCountry}
            />
          )}

          {activeTab === "research" && <WideResearchView />}

          {activeTab === "abilities" && (
            <WideAbilitiesView currentGovernment={nation.government.type} />
          )}

          {activeTab === "reports" && <WideReportsView reports={mockReports} />}
        </div>
      </div>
    </div>
  );
}
