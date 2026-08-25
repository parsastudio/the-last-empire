import React, { useState } from "react";
import { Landmark, Zap } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { TaxSlider } from "@/presentation/components/tactical-map/sidebar/tabs/politics/components/tax-slider";
import { TaxPredictiveImpactBox } from "@/presentation/components/tactical-map/sidebar/tabs/politics/components/tax-predictive-impact-box";

export interface TaxPolicyTier {
  rate: number;
  label: string;
  badge: string;
}

export const TAX_POLICY_TIERS: TaxPolicyTier[] = [
  {
    rate: 0,
    label: "معافیت کامل و اقتصاد رفاهی",
    badge: "معافیت کامل",
  },
  {
    rate: 15,
    label: "اقتصاد متعادل ملی",
    badge: "پایه و استاندارد",
  },
  {
    rate: 25,
    label: "توسعه و جهش صنعتی",
    badge: "رشد صنعتی",
  },
  {
    rate: 35,
    label: "عوارض سنگین حاکمیتی",
    badge: "فشار مالیاتی",
  },
  {
    rate: 50,
    label: "مصادره اضطراری جنگی",
    badge: "اقتصاد جنگی",
  },
];

const TAX_TIER_RATES = TAX_POLICY_TIERS.map((t) => t.rate);

interface TaxControlCardProps {
  taxRate: number;
  baseGdp: number;
  nationId: string;
}

export function TaxControlCard({
  taxRate: initialTaxRate,
  baseGdp,
  nationId,
}: TaxControlCardProps) {
  const [taxRate, setTaxRate] = useState<number>(Math.min(50, initialTaxRate));
  const { dispatchAction } = useGameActions();

  const currentPolicy =
    TAX_POLICY_TIERS.find((t) => t.rate === taxRate) ||
    TAX_POLICY_TIERS.reduce((best, item) =>
      Math.abs(item.rate - taxRate) < Math.abs(best.rate - taxRate)
        ? item
        : best,
    );

  const handleApplyTax = async () => {
    const action = ActionFactory.setTaxRate(nationId, taxRate);
    await dispatchAction(action);
  };

  return (
    <div className="space-y-2.5 font-sans dir-rtl text-right">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Landmark size={13} className="text-diplomacy" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            تنظیمات مالیاتی و قانون
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-md text-gdp border border-border/60">
          {currentPolicy.badge}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3">
        <div className="bg-secondary/40 border border-border/50 px-3 py-2 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            {currentPolicy.label}
          </span>
          <span className="text-xs font-mono font-black text-gdp">
            {PersianNumberFormatter.toPersianDigits(taxRate)}٪
          </span>
        </div>

        <TaxSlider
          currentRate={taxRate}
          tiers={TAX_TIER_RATES}
          onSelectRate={(rate) => setTaxRate(rate)}
        />

        <TaxPredictiveImpactBox newTaxRate={taxRate} baseGdp={baseGdp} />

        <button
          onClick={handleApplyTax}
          className="w-full py-2.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Zap size={13} />
          <span>
            تصویب سیاست مالیاتی (
            {PersianNumberFormatter.toPersianDigits(taxRate)}٪)
          </span>
        </button>
      </div>
    </div>
  );
}
