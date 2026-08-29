import { useMemo } from "react";
import {
  TurnLogEntry,
  Nation,
  CountryRegistry,
  TurnLogFormatter,
  PendingDiplomaticProposal,
  BattleFullReportData,
} from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import {
  Swords,
  Users,
  Binary,
  Coins,
  Skull,
  Info,
  Handshake,
  ShieldAlert,
  Trophy,
  ShoppingCart,
} from "lucide-react";
import { ExportSalesBuyerItem } from "@/presentation/stores/use-ui-store";

interface UseReportCardMetaProps {
  log: TurnLogEntry;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  pendingProposals?: PendingDiplomaticProposal[];
}

export function useReportCardMeta({
  log,
  nationsMap,
  humanNationId,
  pendingProposals = [],
}: UseReportCardMetaProps) {
  const sourceCanonical = CountryRegistry.resolveCanonicalId(
    log.sourceNationId,
  );
  const sourceNation = nationsMap ? nationsMap[sourceCanonical] : null;
  const sourceName = sourceNation ? sourceNation.name : log.sourceNationId;
  const sourceFlag = getFlagEmoji(sourceNation?.flagCode || sourceCanonical);

  let targetName: string | null = null;
  let targetFlag: string | null = null;

  if (log.targetNationId) {
    const targetCanonical = CountryRegistry.resolveCanonicalId(
      log.targetNationId,
    );
    const targetNation = nationsMap ? nationsMap[targetCanonical] : null;
    targetName = targetNation ? targetNation.name : log.targetNationId;
    targetFlag = getFlagEmoji(targetNation?.flagCode || targetCanonical);
  }

  const dynamicMessage = useMemo(() => {
    return TurnLogFormatter.formatMessage(log, nationsMap);
  }, [log, nationsMap]);

  const battleReportData = useMemo<BattleFullReportData | null>(() => {
    if (
      log.eventCode !== "BATTLE_TACTICAL_REPORT" &&
      log.eventCode !== "BATTLE_GLOBAL_NEWS"
    ) {
      return null;
    }
    const rawJson = log.params?.["reportJson"];
    if (!rawJson || typeof rawJson !== "string") return null;
    try {
      return JSON.parse(rawJson) as BattleFullReportData;
    } catch {
      return null;
    }
  }, [log]);

  const isCoalitionFormed = log.eventCode === "COALITION_FORMED";
  const isVictoryAchieved = log.eventCode === "VICTORY_ACHIEVED";
  const isExportSummary = log.eventCode === "ARMS_EXPORT_SUMMARY";

  const exportBuyersList = useMemo<ExportSalesBuyerItem[]>(() => {
    if (!isExportSummary) return [];
    const rawJson = log.params?.["buyersJson"];
    if (!rawJson || typeof rawJson !== "string") return [];
    try {
      return JSON.parse(rawJson) as ExportSalesBuyerItem[];
    } catch {
      return [];
    }
  }, [isExportSummary, log.params]);

  const activePendingProposal = useMemo(() => {
    if (
      log.eventCode !== "DIPLOMATIC_PROPOSAL_SENT" ||
      !humanNationId ||
      !log.targetNationId
    ) {
      return null;
    }

    const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);
    const canonicalTarget = CountryRegistry.resolveCanonicalId(
      log.targetNationId,
    );

    if (canonicalTarget !== canonicalHuman) {
      return null;
    }

    const logProposalId = log.params?.["proposalId"]
      ? String(log.params["proposalId"])
      : null;

    if (logProposalId) {
      const directMatch = pendingProposals.find((p) => p.id === logProposalId);
      if (directMatch) return directMatch;
    }

    return (
      pendingProposals.find((p) => {
        const pSender = CountryRegistry.resolveCanonicalId(p.senderNationId);
        const pReceiver = CountryRegistry.resolveCanonicalId(
          p.receiverNationId,
        );
        return pSender === sourceCanonical && pReceiver === canonicalHuman;
      }) || null
    );
  }, [log, humanNationId, pendingProposals, sourceCanonical]);

  const isIncomingInteractiveProposal = Boolean(activePendingProposal);

  const style = useMemo(() => {
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
  }, [
    log.eventCode,
    isIncomingInteractiveProposal,
    isCoalitionFormed,
    isVictoryAchieved,
    isExportSummary,
  ]);

  return {
    sourceCanonical,
    sourceName,
    sourceFlag,
    sourceNation,
    targetName,
    targetFlag,
    dynamicMessage,
    battleReportData,
    isCoalitionFormed,
    isVictoryAchieved,
    isExportSummary,
    exportBuyersList,
    activePendingProposal,
    isIncomingInteractiveProposal,
    style,
  };
}
