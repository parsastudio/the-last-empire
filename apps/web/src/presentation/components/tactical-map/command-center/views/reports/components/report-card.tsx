import React from "react";
import { useTranslations } from "next-intl";
import {
  TurnLogEntry,
  Nation,
  CountryRegistry,
  PendingDiplomaticProposal,
} from "@geopolitics/domain";
import {
  Coins,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  ShieldAlert,
  Trophy,
  Factory,
} from "lucide-react";
import { ProposalActionButtons } from "./proposal-action-buttons";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { useReportCardMeta } from "./hooks/use-report-card-meta";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const t = useTranslations("reports.card");
  const { isRtl, formatCurrency } = useLocaleFormatter();
  const openModal = useUiStore((state) => state.openModal);

  const {
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
    isMachineryTrade,
    exportBuyersList,
    activePendingProposal,
    isIncomingInteractiveProposal,
    style,
  } = useReportCardMeta({
    log,
    nationsMap,
    humanNationId,
    pendingProposals,
  });

  const handleOpenCoalition = () => {
    const memberIdsRaw = String(log.params?.["memberIds"] || "");
    const memberIds = memberIdsRaw
      ? memberIdsRaw.split(",").filter(Boolean)
      : [];
    const targetCanonical = sourceCanonical;
    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      humanNationId || "",
    );

    openModal({
      type: "COALITION_ALERT",
      data: {
        targetNationId: targetCanonical,
        targetName: sourceName,
        targetFlagCode: sourceNation?.flagCode || targetCanonical,
        isHumanTarget: targetCanonical === canonicalHuman,
        memberIds,
        turn: log.turn,
      },
    });
  };

  const handleOpenExportDetails = () => {
    const totalProfit = Number(log.params?.["totalProfit"] || 0);
    openModal({
      type: "EXPORT_SALES",
      data: {
        buyers: exportBuyersList,
        totalProfit,
        turn: log.turn,
      },
    });
  };

  const Icon = style.icon;
  const foreignAidAmount = Number(log.params?.["amount"] || 0);

  return (
    <div
      className={`p-4.5 rounded-3xl border ${style.border} ${style.cardBg} flex items-start gap-4 transition-all font-sans text-start backdrop-blur-md shadow-md hover:shadow-xl relative overflow-hidden`}
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
              {t("hegemonyBadge")}
            </span>
          )}

          {isCoalitionFormed && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-xl shrink-0 animate-pulse">
              <ShieldAlert size={12} />
              {t("crisisBadge")}
            </span>
          )}

          {isExportSummary && (
            <span
              className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1 rounded-xl shrink-0 border ${
                log.eventCode === "MACHINERY_EXPORT_SUMMARY"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}
            >
              {log.eventCode === "MACHINERY_EXPORT_SUMMARY" ? (
                <Factory size={12} />
              ) : (
                <Coins size={12} />
              )}
              <span>
                {log.eventCode === "MACHINERY_EXPORT_SUMMARY"
                  ? t("machineryExportBadge")
                  : t("armsExportBadge")}
              </span>
            </span>
          )}

          {isMachineryTrade && !isExportSummary && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-xl shrink-0">
              <Factory size={12} />
              {t("industrialExport")}
            </span>
          )}

          {log.eventCode === "FOREIGN_AID_SENT" && foreignAidAmount > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-xl shrink-0">
              <Coins size={12} />
              <span>+{formatCurrency(foreignAidAmount, true)}</span>
            </span>
          )}

          {isIncomingInteractiveProposal && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-xl shrink-0 animate-pulse">
              <Sparkles size={12} />
              {t("pendingDecision")}
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
                    {isRtl ? (
                      <ArrowLeft
                        size={13}
                        className="text-muted-foreground shrink-0"
                      />
                    ) : (
                      <ArrowRight
                        size={13}
                        className="text-muted-foreground shrink-0"
                      />
                    )}
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm border ${
                log.eventCode === "MACHINERY_EXPORT_SUMMARY"
                  ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/50 hover:border-cyan-400"
                  : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/50 hover:border-emerald-400"
              }`}
            >
              <Eye size={14} />
              <span>{t("viewBuyers")}</span>
            </button>
          )}

          {isVictoryAchieved && (
            <button
              onClick={() => openModal({ type: "VICTORY_DEBRIEF" })}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:border-amber-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Trophy size={14} />
              <span>{t("viewVictory")}</span>
            </button>
          )}

          {isCoalitionFormed && (
            <button
              onClick={handleOpenCoalition}
              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/50 hover:border-rose-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Eye size={14} />
              <span>{t("viewCoalition")}</span>
            </button>
          )}

          {battleReportData && (
            <button
              onClick={() =>
                openModal({
                  type: "BATTLE_DEBRIEF",
                  reportData: battleReportData,
                })
              }
              className="px-3.5 py-1.5 bg-military/15 hover:bg-military/25 text-military border border-military/40 hover:border-military/60 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Eye size={14} />
              <span>{t("viewBattle")}</span>
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
