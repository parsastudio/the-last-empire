import React, { useState } from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Zap, Coins, ShieldAlert } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

interface ProxyAllocationModalProps {
  isOpen: boolean;
  targetNationId: string;
  targetName: string;
  targetFlagCode: string;
  targetStability: number;
  targetGdp: number;
  userTreasury: number;
  nationId?: string;
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
  nationId = "NATION_118",
  onClose,
}: ProxyAllocationModalProps) {
  const [desiredDrain, setDesiredDrain] = useState<number>(2);
  const { dispatchAction } = useGameActions();

  if (!isOpen) return null;

  const requiredBudget = Math.floor(targetGdp * (desiredDrain / 2) * 0.01);
  const canAfford = userTreasury >= requiredBudget;
  const flagEmoji = getFlagEmoji(targetFlagCode || targetNationId);

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
      title={`عملیات پنهان و نفوذ نیابتی علیه ${targetName}`}
      subtitle="تخصیص بودجه و تخریب ثبات سیاسی کشور هدف"
      maxWidthClass="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <span
              className="text-3xl select-none"
              role="img"
              aria-label={targetName}
            >
              {flagEmoji}
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                {targetName}
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">
                ثبات فعلی:{" "}
                {PersianNumberFormatter.toPersianDigits(targetStability)}٪ |
                تولید ناخالص: {PersianNumberFormatter.formatCurrency(targetGdp)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-sans">
              میزان افت ثبات مورد نظر:
            </span>
            <span className="font-bold text-military text-sm">
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

          <div className="grid grid-cols-4 gap-2 font-sans">
            <button
              type="button"
              onClick={() => setDesiredDrain(2)}
              className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                desiredDrain === 2
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary hover:bg-secondary/80 border-border/60"
              }`}
            >
              -۲٪ (۱٪ GDP)
            </button>
            <button
              type="button"
              onClick={() => setDesiredDrain(5)}
              className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                desiredDrain === 5
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary hover:bg-secondary/80 border-border/60"
              }`}
            >
              -۵٪ (۲.۵٪ GDP)
            </button>
            <button
              type="button"
              onClick={() => setDesiredDrain(10)}
              className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                desiredDrain === 10
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary hover:bg-secondary/80 border-border/60"
              }`}
            >
              -۱۰٪ (۵٪ GDP)
            </button>
            <button
              type="button"
              onClick={() => setDesiredDrain(15)}
              className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                desiredDrain === 15
                  ? "bg-rose-600 text-white border-rose-500"
                  : "bg-secondary hover:bg-secondary/80 border-border/60 text-rose-500"
              }`}
            >
              -۱۵٪ (حداکثر)
            </button>
          </div>

          <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-2 text-right font-sans">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-muted-foreground font-sans">
                هزینه محاسباتی از خزانه:
              </span>
              <span className="font-bold text-gdp text-sm flex items-center gap-1">
                <Coins size={14} />
                {PersianNumberFormatter.formatCurrency(requiredBudget)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              هزینه نفوذ مستقیماً با قدرت اقتصادی هدف محاسبه می‌شود.
            </p>
          </div>

          <div className="p-3 bg-military/10 border border-military/30 rounded-2xl flex items-center gap-2 text-[10px] text-military font-sans">
            <ShieldAlert size={14} className="shrink-0" />
            <span>
              افت ثبات هدف به زیر ۱۰٪ باعث وقوع کودتای نظامی و سرنگونی رژیم آن
              خواهد شد.
            </span>
          </div>
        </div>

        <button
          onClick={handleFundProxy}
          disabled={requiredBudget <= 0 || !canAfford}
          className="w-full py-3.5 bg-military hover:bg-military/90 disabled:opacity-40 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-military/10 flex items-center justify-center gap-2"
        >
          <Zap size={15} />
          <span>
            {!canAfford
              ? "خزانه ناکافی جهت اجرای عملیات"
              : `اجرای عملیات و کاهش -${PersianNumberFormatter.toPersianDigits(desiredDrain)}٪ ثبات`}
          </span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
