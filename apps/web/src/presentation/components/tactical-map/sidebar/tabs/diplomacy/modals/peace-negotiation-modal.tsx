"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Coins,
  MapPin,
  ShieldAlert,
  Swords,
  Scroll,
  CheckCircle2,
  Scale,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import {
  Nation,
  Province,
  PeaceTermsCalculator,
  ActionFactory,
  CountryRegistry,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface PeaceNegotiationModalProps {
  isOpen: boolean;
  humanNation: Nation | null;
  targetNationId: string | null;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  currentTurn?: number;
  onClose: () => void;
}

export function PeaceNegotiationModal({
  isOpen,
  humanNation,
  targetNationId,
  nationsMap,
  provincesMap,
  currentTurn,
  onClose,
}: PeaceNegotiationModalProps) {
  const t = useTranslations("diplomacy.peaceModal");
  const { formatCurrency, toDigits } = useLocaleFormatter();
  const { dispatchAction, isSubmitting } = useGameActions();
  const [isProcessing, setIsProcessing] = useState(false);

  const targetNation = useMemo(() => {
    if (!targetNationId || !nationsMap) return null;
    const canonical = CountryRegistry.resolveCanonicalId(targetNationId);
    return nationsMap[canonical] || nationsMap[targetNationId] || null;
  }, [targetNationId, nationsMap]);

  const terms = useMemo(() => {
    if (!humanNation || !targetNation) return null;
    return PeaceTermsCalculator.calculateTerms(
      humanNation,
      targetNation,
      nationsMap,
      provincesMap,
      currentTurn,
    );
  }, [humanNation, targetNation, nationsMap, provincesMap, currentTurn]);

  if (!isOpen || !humanNation || !targetNation || !terms) {
    return null;
  }

  const humanFlag = getFlagEmoji(humanNation.flagCode || humanNation.id);
  const targetFlag = getFlagEmoji(targetNation.flagCode || targetNation.id);

  const isDominantAi = terms.ratio >= 2.0;
  const isCrushedAi = terms.ratio <= 0.5;
  const isWhitePeace = terms.settlementType === "WHITE_PEACE";

  const handleDeclinePeace = () => {
    TacticalSound.playTreatyRejected();
    onClose();
  };

  const handleSignTreaty = async () => {
    if (isProcessing || isSubmitting || !terms.canAffordTerms) return;
    try {
      setIsProcessing(true);
      const action = ActionFactory.signPeaceSettlement(
        humanNation.id,
        targetNation.id,
      );
      const res = await dispatchAction(action);
      if (res.success) {
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={t("title", { name: targetNation.name })}
      subtitle={t("subtitle")}
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-start font-sans pb-1">
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4 rounded-3xl flex items-center justify-between gap-3 shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/70 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {humanFlag}
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-foreground block">
                {humanNation.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                {t("twmiValuation")} {formatCurrency(terms.targetTwmi, true)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-xl bg-secondary border border-border/70 text-foreground shadow-sm">
              <Scale size={18} />
            </div>
            <span className="text-[9px] font-mono font-black text-muted-foreground">
              {t("powerRatio", { ratio: toDigits(terms.ratio) })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/70 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {targetFlag}
            </div>
            <div className="space-y-0.5 text-end">
              <span className="text-sm font-black text-foreground block">
                {targetNation.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                {t("twmiValuation")} {formatCurrency(terms.sourceTwmi, true)}
              </span>
            </div>
          </div>
        </div>

        {!terms.canAffordTerms && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 shadow-sm">
            <AlertTriangle
              size={18}
              className="text-rose-400 shrink-0 mt-0.5"
            />
            <div className="space-y-0.5">
              <span className="font-black block text-rose-400">
                {terms.headline}
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {terms.description}
              </p>
            </div>
          </div>
        )}

        <div
          className={`p-4.5 rounded-3xl border space-y-3 shadow-lg relative overflow-hidden ${
            isDominantAi
              ? "bg-rose-950/25 border-rose-500/50"
              : isCrushedAi
                ? "bg-emerald-950/25 border-emerald-500/50"
                : isWhitePeace
                  ? "bg-secondary/40 border-border/70"
                  : terms.isAiOffering
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-amber-950/20 border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scroll size={16} className="text-foreground shrink-0" />
              <h4 className="text-xs font-black text-foreground">
                {terms.headline}
              </h4>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                isDominantAi
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : isCrushedAi
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : isWhitePeace
                      ? "bg-secondary/40 border-border/70"
                      : terms.isAiOffering
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              {isDominantAi
                ? t("badges.aiRefusal")
                : isCrushedAi
                  ? t("badges.aiDesperation")
                  : isWhitePeace
                    ? t("badges.whitePeace")
                    : terms.isAiOffering
                      ? t("badges.aiOffering")
                      : t("badges.humanDemanded")}
            </span>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed font-sans font-medium">
            {terms.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/40 font-mono text-xs">
            {terms.moneyAmount > 0 && (
              <div className="bg-background/80 p-3 rounded-2xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
                  <Coins size={12} className="text-gdp" />
                  <span>
                    {terms.isAiOffering
                      ? t("indemnityPayment")
                      : t("indemnityDemand")}
                  </span>
                </span>
                <span
                  className={`font-black text-sm block ${
                    terms.isAiOffering ? "text-gdp" : "text-military"
                  }`}
                >
                  {terms.isAiOffering ? "+" : "-"}
                  {formatCurrency(terms.moneyAmount, true)}
                </span>
              </div>
            )}

            {terms.concededProvincesNames.length > 0 && (
              <div className="bg-background/80 p-3 rounded-2xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
                  <MapPin size={12} className="text-primary" />
                  <span>
                    {terms.isAiOffering
                      ? t("cededProvinces")
                      : t("demandedProvinces")}
                  </span>
                </span>
                <span className="font-black text-foreground text-xs block truncate font-sans">
                  {terms.concededProvincesNames.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-sans">
          <button
            type="button"
            onClick={handleDeclinePeace}
            className="py-3.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Swords size={15} />
            <span>{t("rejectAndFight")}</span>
          </button>

          <button
            type="button"
            onClick={handleSignTreaty}
            disabled={!terms.canAffordTerms || isProcessing || isSubmitting}
            className={`py-3.5 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none ${
              isDominantAi
                ? "bg-rose-600/20 text-rose-400 border-rose-500/40"
                : "bg-gdp hover:bg-gdp/90 text-primary-foreground border-gdp/30 shadow-gdp/20"
            }`}
          >
            {isProcessing || isSubmitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isDominantAi ? (
              <ShieldAlert size={15} />
            ) : (
              <CheckCircle2 size={15} />
            )}
            <span>
              {isProcessing || isSubmitting
                ? t("submitting")
                : !terms.canAffordTerms
                  ? terms.headline
                  : t("signAndRatify")}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
