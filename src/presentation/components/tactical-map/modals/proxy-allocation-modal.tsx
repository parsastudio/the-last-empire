import React, { useState } from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Zap, Coins, ShieldAlert } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { calculateProxyOperationBudget } from "@/domain/politics/government-label.utility";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface ProxyAllocationModalProps {
  isOpen: boolean;
  targetNationId: string;
  targetName: string;
  targetFlagCode: string;
  targetStability: number;
  targetGdp: number;
  userTreasury: number;
  nationId: string;
  onClose: () => void;
}

export function ProxyAllocationModal({
  isOpen,
  targetNationId,
  targetName,
  targetFlagCode,
  targetStability,
  targetGdp,
  userTreasury,
  nationId,
  onClose,
}: ProxyAllocationModalProps) {
  const [desiredDrain, setDesiredDrain] = useState<number>(2);
  const { dispatchAction } = useGameActions();

  if (!isOpen) return null;

  const requiredBudget = calculateProxyOperationBudget(targetGdp, desiredDrain);
  const canAfford = userTreasury >= requiredBudget;
  const flagEmoji = getFlagEmoji(targetFlagCode || targetNationId);
  const resultingStability = Math.max(0, targetStability - desiredDrain);
  const willTriggerCoup = resultingStability < 10;

  const handleFundProxy = async () => {
    if (requiredBudget <= 0 || !canAfford) return;

    const action = ActionFactory.fundProxyInfluence(
      nationId,
      targetNationId,
      requiredBudget,
    );

    const formattedCost = PersianNumberFormatter.formatCurrency(requiredBudget);

    const success = await dispatchAction(
      action,
      `عملیات پنهان علیه ${targetName} اجرا شد. ثبات به میزان -${PersianNumberFormatter.toPersianDigits(desiredDrain)}٪ کاهش یافت. (هزینه: ${formattedCost})`,
    );

    if (success) {
      onClose();
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`عملیات پنهان | ${targetName}`}
      subtitle={`تخریب ثبات سیاسی ${targetName}`}
      maxWidthClass="max-w-sm"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl">
        <div className="bg-secondary/50 border border-border/80 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-3xl select-none"
              role="img"
              aria-label={targetName}
            >
              {flagEmoji}
            </span>
            <div>
              <h4 className="text-xs font-extrabold text-foreground">
                {targetName}
              </h4>
              <span className="text-[9px] text-muted-foreground font-mono">
                {targetNationId}
              </span>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-[9px] text-muted-foreground block font-sans font-bold">
              ثبات فعلی
            </span>
            <span className="text-xs font-bold text-military">
              {PersianNumberFormatter.toPersianDigits(targetStability)}٪
            </span>
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px] font-bold">
              میزان کاهش ثبات:
            </span>
            <span className="font-bold text-military text-xs">
              -{PersianNumberFormatter.toPersianDigits(desiredDrain)}٪
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={desiredDrain}
            onChange={(e) => setDesiredDrain(Number(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg"
          />

          <PercentageSelector
            options={[
              { pct: 2, label: "-۲٪" },
              { pct: 5, label: "-۵٪" },
              { pct: 10, label: "-۱۰٪" },
              { pct: 15, label: "-۱۵٪", isMax: true },
            ]}
            onSelect={(val) => setDesiredDrain(val)}
            colorVariant="military"
          />

          <div className="bg-secondary/50 border border-border/70 p-3.5 rounded-2xl space-y-1.5 text-right font-sans">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-muted-foreground font-sans text-[11px] font-bold">
                هزینه عملیات:
              </span>
              <span className="font-bold text-gdp text-xs flex items-center gap-1">
                <Coins size={14} />
                {PersianNumberFormatter.formatCurrency(requiredBudget)}
              </span>
            </div>
          </div>

          {willTriggerCoup && (
            <div className="p-3 bg-military/15 border border-military/40 rounded-2xl flex items-center gap-2.5 text-[10px] text-military font-sans font-bold">
              <ShieldAlert size={16} className="shrink-0" />
              <span>
                هشدار: کاهش ثبات به زیر ۱۰٪ باعث کودتا و سرنگونی رژیم می‌شود.
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleFundProxy}
          disabled={requiredBudget <= 0 || !canAfford}
          className="w-full py-3.5 bg-military hover:bg-military/90 disabled:opacity-40 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-military/20 flex items-center justify-center gap-2 border border-military/30"
        >
          <Zap size={15} />
          <span>
            {!canAfford
              ? "خزانه ناکافی"
              : `تایید و اختصاص ${PersianNumberFormatter.formatCurrency(requiredBudget)}`}
          </span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
