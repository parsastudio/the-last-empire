import { ReportSeverity } from "@/domain/reports/combat-report.schema";
import {
  ShieldAlert,
  Award,
  AlertTriangle,
  Info,
  LucideIcon,
} from "lucide-react";

export interface SeverityStyle {
  bg: string;
  text: string;
  badge: string;
  label: string;
  icon: LucideIcon;
}

export function getSeverityStyle(severity: ReportSeverity): SeverityStyle {
  switch (severity) {
    case "CRITICAL_DEFEAT":
    case "DEFEAT":
      return {
        bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30",
        text: "text-rose-500",
        badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        label: "شکست سنگین",
        icon: ShieldAlert,
      };
    case "CRUSHING_VICTORY":
    case "VICTORY":
      return {
        bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
        text: "text-emerald-500",
        badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        label: "پیروزی قاطع",
        icon: Award,
      };
    case "PYRRHIC_VICTORY":
      return {
        bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
        text: "text-amber-500",
        badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        label: "پیروزی پرتلفات",
        icon: AlertTriangle,
      };
    default:
      return {
        bg: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30",
        text: "text-sky-500",
        badge: "bg-sky-500/20 text-sky-400 border-sky-500/30",
        label: "اطلاعیه",
        icon: Info,
      };
  }
}
