import React from "react";
import { ShieldCheck } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

interface AntiCorruptionCardProps {
  nationId?: string;
  treasury?: number;
}

export function AntiCorruptionCard({
  nationId = "NATION_118",
  treasury = 100000,
}: AntiCorruptionCardProps) {
  const canAfford = treasury >= 25000;
  const { dispatchAction } = useGameActions();

  const handleAntiCorruption = async () => {
    if (!canAfford) return;

    const action = ActionFactory.antiCorruptionDrive(nationId, 25000);
    await dispatchAction(
      action,
      "مبلغ $25,000 به آژانس بازرسی ملی تزریق شد و شاخص فساد اداری کاهش یافت.",
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پروژه‌های مبارزه با فساد
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            بودجه بازرسی ملی:
          </span>
          <span className="font-bold text-gdp">$25,000</span>
        </div>
        <button
          onClick={handleAntiCorruption}
          disabled={!canAfford}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
        >
          {canAfford
            ? "تزریق بودجه مبارزه با فساد (-۵٪ فساد)"
            : "خزانه ناکافی جهت طرح ضدفساد"}
        </button>
      </div>
    </div>
  );
}
