import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { UnitType } from "@/domain/military/military.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { NationGettersUtility } from "@geopolitics/domain";

export interface ArmsSellerOption {
  id: string;
  name: string;
  flagCode: string;
  techLevel: number;
  alignment: number;
  tension: number;
  rank: number;
  isEligible: boolean;
}

interface UseWideArmsMarketFormProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  selectedTargetCode?: string | null;
}

export function useWideArmsMarketForm({
  nation,
  nationsMap,
  provincesMap,
  selectedTargetCode,
}: UseWideArmsMarketFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType>("ARMOR");
  const [quantity, setQuantity] = useState<number>(1);

  const { dispatchAction, isSubmitting } = useGameActions();

  const sellerOptions = useMemo<ArmsSellerOption[]>(() => {
    if (!nationsMap) return [];
    const query = searchQuery.trim().toLowerCase();
    const rankLookup = NationGettersUtility.calculateRankMap(
      nationsMap,
      provincesMap,
    );

    return Object.values(nationsMap)
      .filter((n) => n.id !== nation.id && n.isAlive)
      .map((n) => {
        const canonical = CountryRegistry.resolveCanonicalId(n.id);
        const rel = nation.relations[canonical] || nation.relations[n.id];
        const alignment = rel ? (rel.alignment ?? 0) : 0;
        const tension = rel ? (rel.tension ?? 10) : 10;
        const isEligible = alignment >= 15 && tension < 60;
        const rank = rankLookup.get(canonical) ?? 99;

        return {
          id: canonical,
          name: n.name,
          flagCode: n.flagCode || "IR",
          techLevel: n.military.techLevel,
          alignment,
          tension,
          rank,
          isEligible,
        };
      })
      .filter((c) => c.isEligible)
      .sort((a, b) => {
        if (b.techLevel !== a.techLevel) return b.techLevel - a.techLevel;
        return a.rank - b.rank;
      })
      .filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.flagCode.toLowerCase().includes(query),
      );
  }, [nationsMap, provincesMap, nation.id, nation.relations, searchQuery]);

  const defaultSellerId = useMemo(() => {
    if (selectedTargetCode) {
      const cleanCode = CountryRegistry.resolveCanonicalId(selectedTargetCode);
      const matched = sellerOptions.find(
        (c) =>
          c.id.toUpperCase() === cleanCode ||
          c.flagCode.toUpperCase() === cleanCode,
      );
      if (matched) return matched.id;
    }
    return sellerOptions[0]?.id || "";
  }, [selectedTargetCode, sellerOptions]);

  const [selectedSellerId, setSelectedSellerId] =
    useState<string>(defaultSellerId);

  const selectedSeller = useMemo(() => {
    return sellerOptions.find((c) => c.id === selectedSellerId) || null;
  }, [sellerOptions, selectedSellerId]);

  const sellerNation = useMemo(() => {
    if (!nationsMap || !selectedSellerId) return null;
    const canonical = CountryRegistry.resolveCanonicalId(selectedSellerId);
    return nationsMap[canonical] || nationsMap[selectedSellerId] || null;
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
        nation.relations[canonical] || nation.relations[partner.id];

      if (partnerRel?.stance === "WAR") {
        const enemyNavalPower =
          (partner.military.navalFleet || 0) *
          (partner.military.techLevel || 1);
        if (enemyNavalPower > buyerNavalPower) return true;
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
    await dispatchAction(
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
    dispatchAction,
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
