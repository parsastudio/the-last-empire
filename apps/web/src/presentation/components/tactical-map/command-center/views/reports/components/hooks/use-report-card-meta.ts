import { useMemo } from "react";
import {
  TurnLogEntry,
  Nation,
  TurnLogFormatter,
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
  const { locale } = useLocaleFormatter();

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
    return TurnLogFormatter.formatMessage(log, nationsMap, locale);
  }, [log, nationsMap, locale]);

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
