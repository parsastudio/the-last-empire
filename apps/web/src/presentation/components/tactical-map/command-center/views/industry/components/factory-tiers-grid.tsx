import React from "react";
import { useTranslations } from "next-intl";
import { Layers, Factory } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { FactoryBatch } from "@geopolitics/domain";
import { FactoryTierCard } from "./factory-tier-card";
import { useFactoryTierProcurement } from "../hooks/use-factory-tier-procurement";

interface FactoryTiersGridProps {
  nationId: string;
  treasury: number;
  batches?: FactoryBatch[];
  totalFactories: number;
  targetTechLevel: number;
  buyerIndustrialLevel?: number;
  sellerId?: string;
  actionType?: "DOMESTIC" | "IMPORT";
  actionLabel?: string;
}

export function FactoryTiersGrid({
  nationId,
  treasury,
  batches,
  totalFactories,
  targetTechLevel,
  buyerIndustrialLevel,
  sellerId,
  actionType = "DOMESTIC",
  actionLabel,
}: FactoryTiersGridProps) {
  const t = useTranslations("industry.tiers");

  const { tierUpgradeItems, feedbacks, isSubmitting, handleUpgradeTier } =
    useFactoryTierProcurement({
      nationId,
      treasury,
      batches,
      targetTechLevel,
      buyerIndustrialLevel,
      totalFactories,
      sellerId,
      actionType,
    });

  const effectiveActionLabel =
    actionLabel ||
    (actionType === "IMPORT"
      ? t("importActionDefault")
      : t("domesticActionDefault"));

  return (
    <div className="space-y-3.5 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gdp/15 border border-gdp/30 text-gdp">
            <Layers size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground">
              {t("headerTitle")}
            </h3>
            <span className="text-[10px] text-muted-foreground">
              {actionType === "IMPORT"
                ? t("headerSubtitleImport")
                : t("headerSubtitleDomestic")}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono bg-secondary/80 border border-border/80 px-3 py-1 rounded-xl font-bold text-muted-foreground flex items-center gap-1.5 shadow-sm">
          <Factory size={12} className="text-gdp" />
          <span>
            {t("activeTiersCount", {
              count: PersianNumberFormatter.toPersianDigits(
                tierUpgradeItems.length,
              ),
            })}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
        {tierUpgradeItems.map((item) => (
          <FactoryTierCard
            key={`${item.batch.techLevel}-${item.rankIndex}`}
            item={item}
            totalFactories={totalFactories}
            actionLabel={effectiveActionLabel}
            feedbacks={feedbacks[item.rankIndex]}
            isSubmitting={isSubmitting}
            onUpgrade={handleUpgradeTier}
          />
        ))}
      </div>
    </div>
  );
}
