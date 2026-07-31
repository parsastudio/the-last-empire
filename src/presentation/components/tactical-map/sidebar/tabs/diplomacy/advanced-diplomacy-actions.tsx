import React from "react";
import { Handshake, CheckCircle2, Flame, Ban } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

interface AdvancedDiplomacyActionsProps {
  targetName: string;
  targetNationId?: string;
  nationId?: string;
  isTradeEmbargoed?: boolean;
  onOpenProxyModal?: () => void;
}

export function AdvancedDiplomacyActions({
  targetName,
  targetNationId = "NATION_15",
  nationId = "NATION_118",
  isTradeEmbargoed = false,
  onOpenProxyModal,
}: AdvancedDiplomacyActionsProps) {
  const { dispatchAction } = useGameActions();

  const handleNonAggression = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "NON_AGGRESSION_PACT",
    );
    await dispatchAction(
      action,
      `پیشنهاد پیمان عدم تخاصم به ${targetName} ابلاغ گردید.`,
    );
  };

  const handleAlliance = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "FULL_ALLIANCE",
    );
    await dispatchAction(
      action,
      `پیشنهاد معاهده دفاعی مشترک به ${targetName} ارسال گردید.`,
    );
  };

  const handleSeverTrade = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "SEVER_TRADE_RELATIONS",
    );
    await dispatchAction(
      action,
      `قطع روابط تجاری و تحریم اقتصادی علیه ${targetName} اعمال گردید. نظر دو کشور به ۳۰- افت کرد.`,
    );
  };

  return (
    <div className="space-y-2 dir-rtl text-right">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
        گزینه‌های تعامل و دیپلماسی پیشرفته
      </span>

      <div className="space-y-2">
        <button
          onClick={handleSeverTrade}
          disabled={isTradeEmbargoed}
          className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer space-y-1 ${
            isTradeEmbargoed
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 opacity-60 cursor-not-allowed"
              : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">
              {isTradeEmbargoed
                ? "روابط تجاری با این کشور قطع است"
                : "قطع روابط تجاری و تحریم اقتصادی"}
            </span>
            <Ban size={13} className="text-rose-500" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            افت فوری نظر هر دو کشور به ۳۰- و اعمال تحریم تجاری بدون نقض
            پیمان‌ها.
          </p>
        </button>

        <button
          onClick={() => {
            if (onOpenProxyModal) {
              onOpenProxyModal();
            }
          }}
          className="w-full p-3 rounded-xl bg-military/10 hover:bg-military/20 border border-military/30 text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military">
              راه‌اندازی عملیات و جنگ نیابتی
            </span>
            <Flame size={13} className="text-military" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            ورود به مرکز اختصاص بودجه نفوذ برای تضعیف ثبات سیاسی {targetName}.
          </p>
        </button>

        <button
          onClick={handleNonAggression}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              پیشنهاد پیمان عدم تخاصم
            </span>
            <Handshake size={13} className="text-treasury" />
          </div>
        </button>

        <button
          onClick={handleAlliance}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              پیشنهاد اتحاد نظامی کامل
            </span>
            <CheckCircle2 size={13} className="text-gdp" />
          </div>
        </button>
      </div>
    </div>
  );
}
