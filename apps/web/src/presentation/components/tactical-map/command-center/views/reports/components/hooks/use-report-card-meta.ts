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
import { ExportSalesBuyerItem } from "@/presentation/stores/use-ui-store";
import { ReportCardStylerUtility } from "../utils/report-card-styler.utility";
import { usePendingProposalMatcher } from "./use-pending-proposal-matcher";

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

  const activePendingProposal = usePendingProposalMatcher({
    log,
    humanNationId,
    pendingProposals,
    sourceCanonical,
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
