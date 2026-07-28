import React from "react";
import { Clock, X } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { RecruitmentOrder } from "@/domain/military/military.schema";

interface RecruitmentQueueCardProps {
  queue?: RecruitmentOrder[];
  nationId?: string;
}

export function RecruitmentQueueCard({
  queue = [],
  nationId = "NATION_118",
}: RecruitmentQueueCardProps) {
  const { dispatchAction } = useGameActions();

  if (!queue || queue.length === 0) return null;

  const handleCancelOrder = async (orderId: string) => {
    await dispatchAction(
      {
        id: `cancel-${orderId}`,
        nationId,
        type: "CANCEL_RECRUITMENT",
        orderId,
      },
      "سفارش لغو شد و هزینه پرداختی مسترد گردید.",
    );
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Clock size={13} className="text-treasury" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          صف ساخت و استقرار یگان‌ها
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {queue.map((item) => (
          <div
            key={item.id}
            className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between"
          >
            <div className="space-y-0.5 text-right">
              <span className="text-xs font-bold text-foreground block font-sans">
                {item.unitType} ({item.quantity} یگان)
              </span>
              <span className="text-[9px] text-treasury block font-sans">
                {item.turnsRemaining} نوبت تا آمادگی کامل
              </span>
            </div>

            <button
              onClick={() => handleCancelOrder(item.id)}
              className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="لغو سفارش"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
