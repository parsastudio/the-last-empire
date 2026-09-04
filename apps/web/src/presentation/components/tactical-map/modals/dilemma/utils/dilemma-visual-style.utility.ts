import {
  Globe,
  Coins,
  Binary,
  Landmark,
  Swords,
  LucideIcon,
} from "lucide-react";
import { DilemmaCategory, DilemmaUrgency } from "@geopolitics/domain";

export interface DilemmaCategoryVisual {
  icon: LucideIcon;
  labelFa: string;
  textColor: string;
  bgBadge: string;
  borderColor: string;
  glowGradient: string;
}

export class DilemmaVisualStyleUtility {
  public static getCategoryVisual(
    category: DilemmaCategory,
  ): DilemmaCategoryVisual {
    switch (category) {
      case "GEOPOLITICAL":
        return {
          icon: Globe,
          labelFa: "بحران ژئوپلیتیک و دیپلماسی",
          textColor: "text-primary",
          bgBadge: "bg-primary/15 text-primary border-primary/30",
          borderColor: "border-primary/40",
          glowGradient: "from-primary/15 via-card/95 to-primary/5",
        };
      case "ECONOMIC":
        return {
          icon: Coins,
          labelFa: "رویداد کلان اقتصادی و صنایع",
          textColor: "text-gdp",
          bgBadge: "bg-gdp/15 text-gdp border-gdp/30",
          borderColor: "border-gdp/40",
          glowGradient: "from-gdp/15 via-card/95 to-gdp/5",
        };
      case "ESPIONAGE":
        return {
          icon: Binary,
          labelFa: "عملیات ویژه اطلاعات و امنیت",
          textColor: "text-purple-400",
          bgBadge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          borderColor: "border-purple-500/40",
          glowGradient: "from-purple-950/30 via-card/95 to-purple-950/15",
        };
      case "DOMESTIC":
        return {
          icon: Landmark,
          labelFa: "ثبات سیاسی و امور حاکمیتی",
          textColor: "text-amber-400",
          bgBadge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          borderColor: "border-amber-500/40",
          glowGradient: "from-amber-950/30 via-card/95 to-amber-950/15",
        };
      case "MILITARY":
      default:
        return {
          icon: Swords,
          labelFa: "فرماندهی ارتش و آمادگی دفاعی",
          textColor: "text-military",
          bgBadge: "bg-military/15 text-military border-military/30",
          borderColor: "border-military/40",
          glowGradient: "from-military/15 via-card/95 to-military/5",
        };
    }
  }

  public static getUrgencyBadgeClass(urgency: DilemmaUrgency): string {
    switch (urgency) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
      case "HIGH":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MEDIUM":
        return "bg-primary/20 text-primary border-primary/40";
      case "LOW":
      default:
        return "bg-secondary text-muted-foreground border-border/60";
    }
  }

  public static getUrgencyLabel(urgency: DilemmaUrgency): string {
    switch (urgency) {
      case "CRITICAL":
        return "وضعیت اضطراری";
      case "HIGH":
        return "اولویت بالا";
      case "MEDIUM":
        return "اولویت عادی";
      case "LOW":
      default:
        return "گزارش دوره‌ای";
    }
  }
}
