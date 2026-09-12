import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  TurnLogEntry,
  Nation,
  PendingDiplomaticProposal,
  BattleFullReportData,
} from "@geopolitics/domain";
import { ExportSalesBuyerItem } from "@/presentation/stores/use-ui-store";
import { ReportCardStylerUtility } from "../utils/report-card-styler.utility";
import { usePendingProposalMatcher } from "./use-pending-proposal-matcher";
import { NationResolverUtility } from "@/presentation/utils/nation-resolver.utility";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const { locale, formatCurrency, toDigits } = useLocaleFormatter();
  const tEvents = useTranslations("reports.events");
  const tDiplomacy = useTranslations("diplomacy");

  const source = useMemo(
    () => NationResolverUtility.resolve(log.sourceNationId, nationsMap, locale),
    [log.sourceNationId, nationsMap, locale],
  );

  const target = useMemo(() => {
    if (!log.targetNationId) return null;
    return NationResolverUtility.resolve(
      log.targetNationId,
      nationsMap,
      locale,
    );
  }, [log.targetNationId, nationsMap, locale]);

  const dynamicMessage = useMemo(() => {
    const params = log.params || {};
    const srcName = source.name;
    const trgName = target?.name || "";

    switch (log.eventCode) {
      case "WAR_DECLARED":
        if (params["isRetaliation"]) {
          return tEvents("WAR_DECLARED_RETALIATION", {
            source: srcName,
            target: String(params["protectedTargetName"] || trgName),
          });
        }
        return tEvents("WAR_DECLARED", { source: srcName, target: trgName });

      case "VICTORY_ACHIEVED":
        if (params["reason"] === "HUMAN_PLAYER_DEFEATED") {
          return tEvents("HUMAN_DEFEATED", { source: srcName });
        }
        return tEvents("VICTORY_ACHIEVED", { source: srcName });

      case "COALITION_FORMED":
        return tEvents("COALITION_FORMED", { source: srcName });

      case "BATTLE_TACTICAL_REPORT": {
        if (params["humanHeadline"]) {
          return String(params["humanHeadline"]);
        }
        const outcome = String(params["outcome"] || "VICTORY");
        const ratio = toDigits(String(params["ratio"] || "1"));
        if (outcome === "CAPITULATION") {
          return tEvents("BATTLE_CAPITULATION", {
            source: srcName,
            target: trgName,
            ratio,
          });
        }
        if (outcome === "DEFENDED") {
          return tEvents("BATTLE_DEFENDED", {
            source: srcName,
            target: trgName,
          });
        }
        return tEvents("BATTLE_VICTORY", { source: srcName, target: trgName });
      }

      case "BATTLE_GLOBAL_NEWS": {
        const outcome = String(params["outcome"] || "VICTORY");
        if (outcome === "DEFENDED") {
          return tEvents("BATTLE_DEFENDED", {
            source: srcName,
            target: trgName,
          });
        }
        return tEvents("BATTLE_VICTORY", { source: srcName, target: trgName });
      }

      case "NATION_ANNEXED":
        return tEvents("NATION_ANNEXED", { source: srcName, target: trgName });

      case "NATION_COLLAPSED":
        return tEvents("NATION_COLLAPSED", { source: srcName });

      case "NATION_BANKRUPTCY":
        return tEvents("NATION_BANKRUPTCY", { source: srcName });

      case "DIPLOMATIC_PROPOSAL_SENT": {
        const treatyType = String(params["treatyType"] || "PEACE_TREATY");
        let proposalLabel = treatyType;
        try {
          proposalLabel = tDiplomacy(`proposalTypes.${treatyType}`);
        } catch {}
        return tEvents("DIPLOMATIC_PROPOSAL_SENT", {
          source: srcName,
          target: trgName,
          proposal: proposalLabel,
        });
      }

      case "TREATY_ACCEPTED": {
        const treatyType = String(params["treatyType"] || "PEACE_TREATY");
        let proposalLabel = treatyType;
        try {
          proposalLabel = tDiplomacy(`proposalTypes.${treatyType}`);
        } catch {}
        return tEvents("TREATY_ACCEPTED", {
          source: srcName,
          target: trgName,
          proposal: proposalLabel,
        });
      }

      case "TREATY_REJECTED": {
        const treatyType = String(params["treatyType"] || "PEACE_TREATY");
        let proposalLabel = treatyType;
        try {
          proposalLabel = tDiplomacy(`proposalTypes.${treatyType}`);
        } catch {}
        return tEvents("TREATY_REJECTED", {
          source: srcName,
          target: trgName,
          proposal: proposalLabel,
        });
      }

      case "TREATY_CANCELLED":
        return tEvents("TREATY_CANCELLED", {
          source: srcName,
          target: trgName,
        });

      case "SECURITY_GUARANTEE_SIGNED":
        return tEvents("SECURITY_GUARANTEE_SIGNED", {
          source: srcName,
          target: trgName,
        });

      case "SECURITY_GUARANTEE_CANCELLED":
        return tEvents("SECURITY_GUARANTEE_CANCELLED", {
          source: srcName,
          target: trgName,
        });

      case "DEFENSE_PACT_NEUTRALITY":
        return tEvents("DEFENSE_PACT_NEUTRALITY", { source: srcName });

      case "DEFENSE_PACT_REFUSAL_COMPENSATION":
        return tEvents("DEFENSE_PACT_REFUSAL_COMPENSATION", {
          source: srcName,
          amount: formatCurrency(Number(params["compensationAmount"] || 0)),
        });

      case "EMERGENCY_PROTECTORATE_SIGNED":
        return tEvents("EMERGENCY_PROTECTORATE_SIGNED", {
          source: srcName,
          target: trgName,
        });

      case "EMERGENCY_PROTECTORATE_CANCELLED":
        return tEvents("EMERGENCY_PROTECTORATE_CANCELLED", {
          source: srcName,
          target: trgName,
        });

      case "FOREIGN_AID_SENT":
        return tEvents("FOREIGN_AID_SENT", {
          source: srcName,
          target: trgName,
          amount: formatCurrency(Number(params["amount"] || 0)),
        });

      case "ESPIONAGE_OPERATION":
        return tEvents("ESPIONAGE_OPERATION", {
          target: trgName,
          details: String(params["details"] || log.message),
        });

      case "ARMS_TRADE": {
        const amount = formatCurrency(Number(params["amount"] || 0));
        const role = String(params["role"] || "BUYER");
        const tradeType = String(params["tradeType"] || "ARMS");

        if (tradeType === "MACHINERY") {
          return role === "BUYER"
            ? tEvents("MACHINERY_TRADE_BUY", { target: trgName, amount })
            : tEvents("MACHINERY_TRADE_SELL", { target: trgName, amount });
        }
        return role === "BUYER"
          ? tEvents("ARMS_TRADE_BUY", { target: trgName, amount })
          : tEvents("ARMS_TRADE_SELL", { target: trgName, amount });
      }

      case "ARMS_EXPORT_SUMMARY":
        return tEvents("ARMS_EXPORT_SUMMARY", {
          count: toDigits(Number(params["buyersCount"] || 0)),
          profit: formatCurrency(Number(params["totalProfit"] || 0)),
        });

      case "MACHINERY_EXPORT_SUMMARY":
        return tEvents("MACHINERY_EXPORT_SUMMARY", {
          count: toDigits(Number(params["buyersCount"] || 0)),
          profit: formatCurrency(Number(params["totalProfit"] || 0)),
        });

      case "DILEMMA_RESOLVED":
        return tEvents("DILEMMA_RESOLVED", {
          source: srcName,
          title: String(params["eventTitle"] || ""),
          choice: String(params["choiceLabel"] || ""),
        });

      default:
        return log.message || tEvents("GENERIC_EVENT");
    }
  }, [
    log,
    source.name,
    target?.name,
    locale,
    tEvents,
    tDiplomacy,
    formatCurrency,
    toDigits,
  ]);

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
  const isExportSummary =
    log.eventCode === "ARMS_EXPORT_SUMMARY" ||
    log.eventCode === "MACHINERY_EXPORT_SUMMARY";
  const isMachineryTrade =
    (log.eventCode === "ARMS_TRADE" &&
      log.params?.["tradeType"] === "MACHINERY") ||
    log.eventCode === "MACHINERY_EXPORT_SUMMARY";

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

  const activePendingProposal = usePendingProposalMatcher({
    log,
    humanNationId,
    pendingProposals,
    sourceCanonical: source.canonicalId,
  });

  const isIncomingInteractiveProposal = Boolean(activePendingProposal);

  const style = useMemo(() => {
    return ReportCardStylerUtility.resolveStyle({
      log,
      isVictoryAchieved,
      isCoalitionFormed,
      isExportSummary,
      isIncomingInteractiveProposal,
    });
  }, [
    log,
    isVictoryAchieved,
    isCoalitionFormed,
    isExportSummary,
    isIncomingInteractiveProposal,
  ]);

  return {
    sourceCanonical: source.canonicalId,
    sourceName: source.name,
    sourceFlag: source.flagEmoji,
    sourceNation: source.nation,
    targetName: target?.name ?? null,
    targetFlag: target?.flagEmoji ?? null,
    dynamicMessage,
    battleReportData,
    isCoalitionFormed,
    isVictoryAchieved,
    isExportSummary,
    isMachineryTrade,
    exportBuyersList,
    activePendingProposal,
    isIncomingInteractiveProposal,
    style,
  };
}
