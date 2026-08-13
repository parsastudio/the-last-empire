import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { useActionRunner } from "@/presentation/hooks/game/use-action-runner";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface ArmsSellerOption {
  id: string;
  name: string;
  flagCode: string;
  techLevel: number;
  opinion: number;
  isEligible: boolean;
  reason?: string;
}

interface UseWideArmsMarketFormProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function useWideArmsMarketForm({
  nation,
  nationsMap,
  selectedTargetCode,
}: UseWideArmsMarketFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType>("ARMOR");
  const [quantity, setQuantity] = useState<number>(1);

  const { runAction, isSubmitting } = useActionRunner();

  const sellerOptions = useMemo<ArmsSellerOption[]>(() => {
    if (!nationsMap) return [];
    const query = searchQuery.trim().toLowerCase();

    return Object.values(nationsMap)
      .filter((n) => n.id !== nation.id && n.isAlive)
      .map((n) => {
        const canonical = CountryRegistry.resolveCanonicalId(n.id);
        const rel = nation.relations[n.id] || nation.relations[canonical];
        const opinion = rel ? rel.opinion : 0;
        const isEligible = opinion >= 20;

        let reason = "";
        if (!isEligible) {
          reason = "دیدگاه دیپلماتیک نامناسب (نیازمند دیدگاه ۲۰+)";
        }

        return {
          id: n.id,
          name: n.name,
          flagCode: n.flagCode || "IR",
          techLevel: n.military.techLevel,
          opinion,
          isEligible,
          reason,
        };
      })
      .filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.flagCode.toLowerCase().includes(query),
      );
  }, [nationsMap, nation.id, nation.relations, searchQuery]);

  const defaultSellerId = useMemo(() => {
    if (selectedTargetCode) {
      const cleanCode = selectedTargetCode.toUpperCase();
      const matched = sellerOptions.find(
        (c) =>
          c.id.toUpperCase() === cleanCode ||
          c.flagCode.toUpperCase() === cleanCode,
      );
      if (matched && matched.isEligible) return matched.id;
    }
    const firstEligible = sellerOptions.find((c) => c.isEligible);
    return firstEligible ? firstEligible.id : sellerOptions[0]?.id || "";
  }, [selectedTargetCode, sellerOptions]);

  const [selectedSellerId, setSelectedSellerId] =
    useState<string>(defaultSellerId);

  const selectedSeller = useMemo(() => {
    return sellerOptions.find((c) => c.id === selectedSellerId) || null;
  }, [sellerOptions, selectedSellerId]);

  const sellerNation = useMemo(() => {
    if (!nationsMap || !selectedSellerId) return null;
    const canonical = CountryRegistry.resolveCanonicalId(selectedSellerId);
    return nationsMap[selectedSellerId] || nationsMap[canonical] || null;
  }, [nationsMap, selectedSellerId]);

  const unitStat = MILITARY_UNIT_STATS[selectedUnitType];

  const isSellerTechEligible = useMemo(() => {
    if (!sellerNation) return false;
    return sellerNation.military.techLevel >= unitStat.requiredTechLevel;
  }, [sellerNation, unitStat]);

  const unitPrice = useMemo(() => {
    if (!sellerNation) return 0;
    const sellerCost = MilitaryPricingCalculator.calculateUnitTypePrice(
      selectedUnitType,
      sellerNation.military.techLevel,
      sellerNation.industrialLevel,
    );
    return sellerCost * 2;
  }, [sellerNation, selectedUnitType]);

  const totalPrice = unitPrice * quantity;
  const canAfford = nation.treasury >= totalPrice;

  const isNavalBlockaded = useMemo(() => {
    if (!nationsMap) return false;
    const buyerNavalPower =
      (nation.military.navalFleet || 0) * (nation.military.techLevel || 1);

    for (const partner of Object.values(nationsMap)) {
      if (!partner.isAlive || partner.id === nation.id) continue;
      const canonical = CountryRegistry.resolveCanonicalId(partner.id);
      const partnerRel =
        nation.relations[partner.id] || nation.relations[canonical];

      if (partnerRel?.stance === "WAR") {
        const enemyNavalPower =
          (partner.military.navalFleet || 0) *
          (partner.military.techLevel || 1);
        if (enemyNavalPower > buyerNavalPower) {
          return true;
        }
      }
    }
    return false;
  }, [nationsMap, nation]);

  const handleBuyArms = useCallback(async () => {
    if (
      !selectedSeller ||
      !selectedSeller.isEligible ||
      !isSellerTechEligible ||
      isNavalBlockaded ||
      !canAfford ||
      quantity <= 0
    ) {
      return;
    }

    const action = ActionFactory.buyArmsMarket(
      nation.id,
      selectedSeller.id,
      selectedUnitType,
      quantity,
    );

    const formattedCost = PersianNumberFormatter.formatCurrency(totalPrice);

    await runAction(
      action,
      `خرید فوری ${PersianNumberFormatter.toPersianDigits(quantity.toLocaleString("en-US"))} یگان ${unitStat.nameFa} از ${selectedSeller.name} با موفقیت انجام گردید. (مبلغ: ${formattedCost})`,
    );
  }, [
    nation.id,
    selectedSeller,
    selectedUnitType,
    quantity,
    isSellerTechEligible,
    isNavalBlockaded,
    canAfford,
    totalPrice,
    unitStat,
    runAction,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedUnitType,
    setSelectedUnitType,
    quantity,
    setQuantity,
    sellerOptions,
    selectedSellerId,
    setSelectedSellerId,
    selectedSeller,
    sellerNation,
    unitStat,
    isSellerTechEligible,
    isNavalBlockaded,
    unitPrice,
    totalPrice,
    canAfford,
    isSubmitting,
    handleBuyArms,
  };
}
