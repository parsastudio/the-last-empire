"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { DilemmaEvent, ActionFactory, getNationGdp } from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { DilemmaVisualStyleUtility } from "./dilemma/utils/dilemma-visual-style.utility";
import { DilemmaChoiceCard } from "./dilemma/components/dilemma-choice-card";

interface DilemmaModalProps {
  isOpen: boolean;
  dilemma: DilemmaEvent | null;
  humanNationId: string;
  onClose: () => void;
}

export function DilemmaModal({
  isOpen,
  dilemma,
  humanNationId,
  onClose,
}: DilemmaModalProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const { dispatchAction, isSubmitting } = useGameActions();
  const gameState = useGameStore((state) => state.gameState);

  useEffect(() => {
    if (isOpen && dilemma) {
      TacticalSound.playDilemmaAlert();
    }
  }, [isOpen, dilemma]);

  const humanNation = useMemo(() => {
    return gameState?.nations[humanNationId] ?? null;
  }, [gameState, humanNationId]);

  const nationGdp = useMemo(() => {
    if (!humanNation) return 50_000_000_000;
    return getNationGdp(humanNation, gameState?.provinces);
  }, [humanNation, gameState?.provinces]);

  if (!isOpen || !dilemma) return null;

  const categoryVisual = DilemmaVisualStyleUtility.getCategoryVisual(
    dilemma.category,
  );
  const CategoryIcon = categoryVisual.icon;

  const handleSelectChoice = (choiceId: string) => {
    setSelectedChoiceId(choiceId);
    TacticalSound.playUiClick();
  };

  const handleConfirmAndExecute = async () => {
    if (!selectedChoiceId || isSubmitting) return;

    TacticalSound.playTreatySigned();
    const action = ActionFactory.resolveDilemma(
      humanNationId,
      dilemma.id,
      selectedChoiceId,
    );

    const res = await dispatchAction(action);
    if (res.success) {
      onClose();
    }
  };

  const activeChoice = dilemma.choices.find((c) => c.id === selectedChoiceId);

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title=""
      maxWidthClass="max-w-xl"
      onClose={() => {}}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div
          className={`relative overflow-hidden bg-gradient-to-r ${categoryVisual.glowGradient} border ${categoryVisual.borderColor} p-5 rounded-3xl shadow-xl space-y-3 backdrop-blur-2xl`}
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md shrink-0 ${categoryVisual.bgBadge}`}
            >
              <CategoryIcon size={20} />
            </div>
            <div className="space-y-0.5">
              <span
                className={`text-[11px] font-black ${categoryVisual.textColor}`}
              >
                {categoryVisual.labelFa}
              </span>
              <h3 className="text-base font-black text-foreground tracking-tight">
                {dilemma.titleFa}
              </h3>
            </div>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed font-sans font-medium bg-background/80 border border-border/60 p-3.5 rounded-2xl shadow-inner">
            {dilemma.descriptionFa}
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-1 gap-2.5">
            {dilemma.choices.map((choice, idx) => (
              <DilemmaChoiceCard
                key={choice.id}
                choice={choice}
                choiceIndex={idx}
                isSelected={selectedChoiceId === choice.id}
                nationGdp={nationGdp}
                onSelect={handleSelectChoice}
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirmAndExecute}
            disabled={!selectedChoiceId || isSubmitting}
            className="w-full py-4 px-6 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all shadow-xl shadow-gdp/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border border-gdp/30"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : selectedChoiceId ? (
              <Zap size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>
              {isSubmitting
                ? "در حال ثبت و ابلاغ فرمان حاکمیت..."
                : selectedChoiceId
                  ? `ابلاغ و اجرای فرمان (${activeChoice?.labelFa})`
                  : "ابتدا یکی از گزینه‌های بالا را انتخاب کنید"}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
