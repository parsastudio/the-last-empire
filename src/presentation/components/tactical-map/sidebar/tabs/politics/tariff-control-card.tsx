import React, { useState } from "react";
import { Coins } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface TariffControlCardProps {
  initialTariffRate?: number;
  nationId?: string;
}

export function TariffControlCard({
  initialTariffRate = 10,
  nationId = "NATION_118",
}: TariffControlCardProps) {
  const [tariffRate, setTariffRate] = useState<number>(initialTariffRate);
  const [prevInitialTariff, setPrevInitialTariff] =
    useState<number>(initialTariffRate);
  const { dispatchAction } = useGameActions();

  if (initialTariffRate !== prevInitialTariff) {
    setPrevInitialTariff(initialTariffRate);
    setTariffRate(initialTariffRate);
  }

  const handleApplyTariff = async () => {
    const action = ActionFactory.setTariffRate(nationId, tariffRate);
    await dispatchAction(
      action,
      `تعرفه تجاری گمرک بر روی ${PersianNumberFormatter.toPersianDigits(tariffRate)}٪ تنظیم گردید.`,
    );
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Coins size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تنظیمات تعرفه گمرک و تجارت
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-extrabold text-foreground text-sm">
            {PersianNumberFormatter.toPersianDigits(tariffRate)}٪
          </span>
          <span className="text-muted-foreground">نرخ تعرفه واردات</span>
        </div>

        <input
          type="range"
          min="0"
          max="50"
          value={tariffRate}
          onChange={(e) => setTariffRate(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <button
          onClick={handleApplyTariff}
          className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
        >
          اعمال نرخ جدید تعرفه (
          {PersianNumberFormatter.toPersianDigits(tariffRate)}٪)
        </button>
      </div>
    </div>
  );
}
