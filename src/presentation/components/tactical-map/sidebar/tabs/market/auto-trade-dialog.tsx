import React, { useState } from "react";
import { Bot, ShoppingBag, TrendingDown, ShieldAlert } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { AutoTradeSettings } from "@/domain/nation/nation.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface AutoTradeDialogProps {
  isOpen: boolean;
  nationId: string;
  initialSettings?: AutoTradeSettings;
  onClose: () => void;
}

export function AutoTradeDialog({
  isOpen,
  nationId,
  initialSettings,
  onClose,
}: AutoTradeDialogProps) {
  const [autoBuyDeficit, setAutoBuyDeficit] = useState<boolean>(
    initialSettings?.autoBuyDeficit ?? false,
  );
  const [autoSellOilPercent, setAutoSellOilPercent] = useState<number>(
    initialSettings?.autoSellOilPercent ?? 0,
  );
  const [autoSellSteelPercent, setAutoSellSteelPercent] = useState<number>(
    initialSettings?.autoSellSteelPercent ?? 0,
  );
  const [allowEmergencyLoans, setAllowEmergencyLoans] = useState<boolean>(
    initialSettings?.allowEmergencyLoans ?? true,
  );

  const [prevKey, setPrevKey] = useState<string>("");
  const currentKey = `${isOpen}-${initialSettings?.autoBuyDeficit}-${initialSettings?.autoSellOilPercent}-${initialSettings?.autoSellSteelPercent}-${initialSettings?.allowEmergencyLoans}`;

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (isOpen && initialSettings) {
      setAutoBuyDeficit(initialSettings.autoBuyDeficit ?? false);
      setAutoSellOilPercent(initialSettings.autoSellOilPercent ?? 0);
      setAutoSellSteelPercent(initialSettings.autoSellSteelPercent ?? 0);
      setAllowEmergencyLoans(initialSettings.allowEmergencyLoans ?? true);
    }
  }

  const { dispatchAction } = useGameActions();

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    const action = ActionFactory.configureAutoTrade(
      nationId,
      autoBuyDeficit,
      autoSellOilPercent,
      autoSellSteelPercent,
      allowEmergencyLoans,
    );

    const success = await dispatchAction(
      action,
      "تنظیمات اتوماتیک‌سازی بازرگانی با موفقیت بروزرسانی شد.",
    );

    if (success) {
      onClose();
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="سیستم بازرگانی خودمختار"
      subtitle="تنظیمات هوشمند تامین کسری رفاهی و فروش خودکار مازاد تولید"
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-5 text-right dir-rtl font-sans">
        <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-gdp" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  خرید خودکار کسری رفاهی
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  تامین خودکار سوخت و فولاد شهرها در انتهای نوبت
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAutoBuyDeficit(!autoBuyDeficit)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                autoBuyDeficit ? "bg-gdp" : "bg-secondary border border-border"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  autoBuyDeficit ? "-translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {autoBuyDeficit && (
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                دریافت وام اضطراری در صورت کسری خزانه:
              </span>
              <input
                type="checkbox"
                checked={allowEmergencyLoans}
                onChange={(e) => setAllowEmergencyLoans(e.target.checked)}
                className="accent-gdp cursor-pointer w-4 h-4"
              />
            </div>
          )}
        </div>

        <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-treasury" />
            <div>
              <span className="text-xs font-bold text-foreground block">
                فروش خودکار مازاد تولید
              </span>
              <span className="text-[10px] text-muted-foreground block">
                صرفاً از محل مازاد تولید پس از کسر مصرف داخلی
              </span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-sans">
                  فروش مازاد نفت خام:
                </span>
                <span className="font-bold text-gdp">
                  {PersianNumberFormatter.toPersianDigits(autoSellOilPercent)}٪
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={autoSellOilPercent}
                onChange={(e) => setAutoSellOilPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-sans">
                  فروش مازاد فولاد صنعتی:
                </span>
                <span className="font-bold text-primary">
                  {PersianNumberFormatter.toPersianDigits(autoSellSteelPercent)}
                  ٪
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={autoSellSteelPercent}
                onChange={(e) =>
                  setAutoSellSteelPercent(Number(e.target.value))
                }
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-primary/10 border border-primary/30 rounded-2xl flex items-center gap-2.5 text-[10px] text-primary">
          <ShieldAlert size={15} className="shrink-0" />
          <span>
            سیستم خودمختار هر دست بلافاصله پس از محاسبه رفاه مردم، معاملات بورس
            را تسویه می‌نماید.
          </span>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full py-3.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-gdp/10 flex items-center justify-center gap-2"
        >
          <Bot size={16} />
          <span>ثبت و فعال‌سازی تنظیمات خودمختار</span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
