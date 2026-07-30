import { useMemo } from "react";
import { Cpu, Swords, Fuel, Landmark, LucideIcon } from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/hooks/game/use-game-resources";

export interface PendingDecisionItem {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  tab: string;
}

export function usePendingDecisions(metrics: HumanResourceMetrics) {
  return useMemo(() => {
    const items: PendingDecisionItem[] = [];
    const nation = metrics.nation;

    if (nation && nation.doctrines.doctrinePoints >= 3) {
      items.push({
        id: "doctrines",
        title: "امتیاز دکترین راهبردی آماده تخصیص",
        desc: `شما ${metrics.nation?.doctrines.doctrinePoints.toFixed(1)} امتیاز دکترین دارید. برای ارتقای توانمندی‌های صنعتی اقدام کنید.`,
        icon: Cpu,
        color: "text-gdp",
        tab: "research",
      });
    }

    if (nation && nation.recruitmentQueue.length === 0) {
      items.push({
        id: "military-queue",
        title: "صف ساخت و تجهیز ارتش خالی است",
        desc: "هیچ یگانی در حال ساخت نیست. جهت تقویت نیروهای پادگانی و هوایی سفارش دهید.",
        icon: Swords,
        color: "text-military",
        tab: "military",
      });
    }

    if (metrics.oil < metrics.oilRequiredPerTurn) {
      items.push({
        id: "oil-deficit",
        title: "هشدار کسری ذخایر نفت استراتژیک",
        desc: `مصرف نوبتی (${metrics.oilRequiredPerTurn} بشکه) بیشتر از ذخایر موجود است. جهت تامین انرژی صنایع کشوری از بورس نفت بخرید.`,
        icon: Fuel,
        color: "text-treasury",
        tab: "market",
      });
    }

    if (metrics.stability < 35) {
      items.push({
        id: "stability-warning",
        title: "بحران ثبات سیاسی داخلی",
        desc: `ثبات سیاسی کشور به ${metrics.stability}% افت کرده است. از بخش سیاست برای کنترل مالیات یا طرح ضدفساد استفاده کنید.`,
        icon: Landmark,
        color: "text-military",
        tab: "politics",
      });
    }

    return items;
  }, [metrics]);
}
