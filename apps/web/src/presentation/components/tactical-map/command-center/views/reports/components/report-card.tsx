import React, { useMemo } from "react";
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
  ArrowLeft,
  Handshake,
  Sparkles,
  Eye,
  ShieldAlert,
  Trophy,
  ShoppingCart,
} from "lucide-react";
import { ProposalActionButtons } from "./proposal-action-buttons";
import {
  useUiStore,
  ExportSalesBuyerItem,
} from "@/presentation/stores/use-ui-store";

interface ReportCardProps {
  log: TurnLogEntry;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  pendingProposals?: PendingDiplomaticProposal[];
}

export function ReportCard({
  log,
  nationsMap,
  humanNationId,
  pendingProposals = [],
}: ReportCardProps) {
  const setSelectedBattleDebrief = useUiStore(
    (state) => state.setSelectedBattleDebrief,
  );
  const setSelectedCoalitionAlert = useUiStore(
    (state) => state.setSelectedCoalitionAlert,
  );
  const setIsVictoryDebriefOpen = useUiStore(
    (state) => state.setIsVictoryDebriefOpen,
  );
  const setSelectedExportSalesModal = useUiStore(
    (state) => state.setSelectedExportSalesModal,
  );

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

  const handleOpenCoalition = () => {
    const memberIdsRaw = String(log.params?.["memberIds"] || "");
    const memberIds = memberIdsRaw
      ? memberIdsRaw.split(",").filter(Boolean)
      : [];
    const targetCanonical = sourceCanonical;
    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      humanNationId || "",
    );

    setSelectedCoalitionAlert({
      targetNationId: targetCanonical,
      targetName: sourceName,
      targetFlagCode: sourceNation?.flagCode || targetCanonical,
      isHumanTarget: targetCanonical === canonicalHuman,
      memberIds,
      turn: log.turn,
    });
  };

  const handleOpenExportDetails = () => {
    const totalProfit = Number(log.params?.["totalProfit"] || 0);
    setSelectedExportSalesModal({
      buyers: exportBuyersList,
      totalProfit,
      turn: log.turn,
    });
  };

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

  const Icon = style.icon;

  return (
    <div
      className={`p-4.5 rounded-3xl border ${style.border} ${style.cardBg} flex items-start gap-4 transition-all font-sans text-right dir-rtl backdrop-blur-md shadow-md hover:shadow-xl relative overflow-hidden`}
    >
      <div
        className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${style.iconBg}`}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-foreground leading-relaxed font-sans font-bold flex-1">
            {dynamicMessage}
          </p>

          {isVictoryAchieved && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl shrink-0 animate-pulse">
              <Trophy size={12} />
              افتخار هژمونی جهانی
            </span>
          )}

          {isCoalitionFormed && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-xl shrink-0 animate-pulse">
              <ShieldAlert size={12} />
              بحران بقای ملی
            </span>
          )}

          {isExportSummary && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-xl shrink-0">
              <Coins size={12} />
              درآمد صادراتی
            </span>
          )}

          {isIncomingInteractiveProposal && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-xl shrink-0 animate-pulse">
              <Sparkles size={12} />
              در انتظار تصمیم شما
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
          {(sourceName || targetName) &&
            !isCoalitionFormed &&
            !isVictoryAchieved &&
            !isExportSummary && (
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {sourceName && (
                  <div className="flex items-center gap-1.5 bg-background/90 border border-border/70 px-3 py-1.5 rounded-xl text-muted-foreground shadow-sm">
                    <span className="text-lg select-none">{sourceFlag}</span>
                    <span className="font-black text-foreground">
                      {sourceName}
                    </span>
                  </div>
                )}

                {targetName && (
                  <>
                    <ArrowLeft
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <div className="flex items-center gap-1.5 bg-background/90 border border-border/70 px-3 py-1.5 rounded-xl text-muted-foreground shadow-sm">
                      <span className="text-lg select-none">{targetFlag}</span>
                      <span className="font-black text-foreground">
                        {targetName}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

          {isExportSummary && (
            <button
              onClick={handleOpenExportDetails}
              className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Eye size={14} />
              <span>مشاهده جزئیات و لیست خریداران</span>
            </button>
          )}

          {isVictoryAchieved && (
            <button
              onClick={() => setIsVictoryDebriefOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:border-amber-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Trophy size={14} />
              <span>مشاهده کارنامه و جشن پیروزی</span>
            </button>
          )}

          {isCoalitionFormed && (
            <button
              onClick={handleOpenCoalition}
              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/50 hover:border-rose-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Eye size={14} />
              <span>مشاهده بیانیه پیمان ائتلاف جهانی</span>
            </button>
          )}

          {battleReportData && (
            <button
              onClick={() => setSelectedBattleDebrief(battleReportData)}
              className="px-3.5 py-1.5 bg-military/15 hover:bg-military/25 text-military border border-military/40 hover:border-military/60 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Eye size={14} />
              <span>مشاهده جزئیات و جدول ۳ فاز نبرد</span>
            </button>
          )}

          {isIncomingInteractiveProposal && activePendingProposal && (
            <ProposalActionButtons
              proposal={activePendingProposal}
              humanNationId={humanNationId!}
            />
          )}
        </div>
      </div>
    </div>
  );
}
