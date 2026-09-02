import {
  Trophy,
  ShieldAlert,
  ShoppingCart,
  Handshake,
  Skull,
  Swords,
  Binary,
  Coins,
  Users,
  Info,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { TurnLogEntry } from "@geopolitics/domain";

export interface ReportCardStyleResult {
  cardBg: string;
  border: string;
  icon: LucideIcon;
  iconBg: string;
}

interface StylerParams {
  log: TurnLogEntry;
  isVictoryAchieved: boolean;
  isCoalitionFormed: boolean;
  isExportSummary: boolean;
  isIncomingInteractiveProposal: boolean;
}

export class ReportCardStylerUtility {
  public static resolveStyle({
    log,
    isVictoryAchieved,
    isCoalitionFormed,
    isExportSummary,
    isIncomingInteractiveProposal,
  }: StylerParams): ReportCardStyleResult {
    if (isVictoryAchieved) {
      return {
        cardBg:
          "bg-gradient-to-r from-amber-950/40 via-card/95 to-emerald-950/30",
        border:
          "border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30",
        icon: Trophy,
        iconBg: "bg-amber-500/25 text-amber-300 border-amber-400/50",
      };
    }

    if (isCoalitionFormed) {
      return {
        cardBg: "bg-gradient-to-r from-rose-950/40 via-card/95 to-red-950/30",
        border:
          "border-rose-500/60 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30",
        icon: ShieldAlert,
        iconBg: "bg-rose-500/25 text-rose-300 border-rose-400/50",
      };
    }

    if (isExportSummary) {
      return {
        cardBg:
          "bg-gradient-to-r from-emerald-950/30 via-card/95 to-cyan-950/20",
        border:
          "border-emerald-500/50 shadow-md shadow-emerald-500/10 hover:border-emerald-400",
        icon: ShoppingCart,
        iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      };
    }

    if (isIncomingInteractiveProposal) {
      return {
        cardBg:
          "bg-gradient-to-r from-indigo-950/40 via-card/95 to-purple-950/30",
        border:
          "border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30",
        icon: Handshake,
        iconBg: "bg-indigo-500/25 text-indigo-300 border-indigo-400/50",
      };
    }

    switch (log.eventCode) {
      case "DILEMMA_RESOLVED":
        return {
          cardBg: "bg-purple-950/20",
          border: "border-purple-500/40 hover:border-purple-500",
          icon: Sparkles,
          iconBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        };

      case "NATION_ANNEXED":
      case "NATION_COLLAPSED":
        return {
          cardBg: "bg-red-950/20",
          border: "border-red-600/50 hover:border-red-500",
          icon: Skull,
          iconBg: "bg-red-500/20 text-red-400 border-red-500/40",
        };

      case "WAR_DECLARED":
      case "BATTLE_TACTICAL_REPORT":
      case "BATTLE_GLOBAL_NEWS":
      case "ALLIANCE_INTERVENTION":
      case "ALLIANCE_BETRAYED":
      case "COALITION_MEMBER_FALLEN":
        return {
          cardBg: "bg-rose-950/20",
          border: "border-rose-500/40 hover:border-rose-500",
          icon: Swords,
          iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/40",
        };

      case "ESPIONAGE_OPERATION":
        return {
          cardBg: "bg-amber-950/20",
          border: "border-amber-500/40 hover:border-amber-500",
          icon: Binary,
          iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/40",
        };

      case "FOREIGN_AID_SENT":
      case "ARMS_TRADE":
        return {
          cardBg: "bg-emerald-950/20",
          border: "border-emerald-500/40 hover:border-emerald-500",
          icon: Coins,
          iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        };

      case "DIPLOMATIC_PROPOSAL_SENT":
      case "TREATY_ACCEPTED":
      case "TREATY_REJECTED":
        return {
          cardBg: "bg-indigo-950/20",
          border: "border-indigo-500/40 hover:border-indigo-500",
          icon: Users,
          iconBg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
        };

      case "GENERIC_EVENT":
      default:
        return {
          cardBg: "bg-secondary/30",
          border: "border-border/60 hover:border-border",
          icon: Info,
          iconBg: "bg-secondary text-muted-foreground border-border/50",
        };
    }
  }
}
