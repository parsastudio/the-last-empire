import { useMemo, useCallback } from "react";
import {
  Nation,
  Province,
  CountryRegistry,
  ActionFactory,
  getProvinceGdp,
  LandNeighborResolver,
  NationGettersUtility,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ProvinceNameFormatter } from "@/presentation/utils/province-name-formatter";
import { NationResolverUtility } from "@/presentation/utils/nation-resolver.utility";

interface UseBuyProvinceFormProps {
  provinceId: number | null;
  humanNation: Nation | null;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  onClose: () => void;
}

export function useBuyProvinceForm({
  provinceId,
  humanNation,
  nationsMap,
  provincesMap,
  onClose,
}: UseBuyProvinceFormProps) {
  const { dispatchAction, isSubmitting } = useGameActions();

  const province = useMemo(() => {
    if (!provinceId || !provincesMap) return null;
    return provincesMap[provinceId.toString()] || null;
  }, [provinceId, provincesMap]);

  const ownerEntity = useMemo(() => {
    if (!province) return null;
    return NationResolverUtility.resolve(province.ownerNationId, nationsMap);
  }, [province, nationsMap]);

  const ownerNation = ownerEntity?.nation ?? null;

  const sellerOwnedProvinces = useMemo(() => {
    if (!ownerNation || !provincesMap) return [];
    const canonicalOwner = CountryRegistry.resolveCanonicalId(ownerNation.id);
    return Object.values(provincesMap).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalOwner,
    );
  }, [ownerNation, provincesMap]);

  const sellerProvincesCount = sellerOwnedProvinces.length;
  const isLastProvince = sellerProvincesCount <= 1;

  const sellerCoastalCount = useMemo(() => {
    return sellerOwnedProvinces.filter((p) => Boolean(p.hasSeaAccess)).length;
  }, [sellerOwnedProvinces]);

  const hasSeaAccess = Boolean(province?.hasSeaAccess);
  const isLastCoastalProvince = hasSeaAccess && sellerCoastalCount <= 1;

  const isLandNeighbor = useMemo(() => {
    if (!humanNation || !province || !provincesMap) return false;
    return LandNeighborResolver.hasProvinceLandBorder(
      province.provinceId,
      humanNation.id,
      provincesMap,
    );
  }, [humanNation, province, provincesMap]);

  const buyerHasSea = useMemo(() => {
    if (!humanNation || !provincesMap) return false;
    return NationGettersUtility.hasSeaAccess(humanNation.id, provincesMap);
  }, [humanNation, provincesMap]);

  const isMaritimeAccessible = buyerHasSea && hasSeaAccess;
  const isGeographicallyConnected = isLandNeighbor || isMaritimeAccessible;

  const costMultiplier = hasSeaAccess ? 5 : 4;

  const provinceGdp = useMemo(() => {
    if (!province) return 0;
    return getProvinceGdp(province, ownerNation?.equipmentTechLevel ?? 1.0);
  }, [province, ownerNation]);

  const purchasePrice = useMemo(() => {
    if (!provinceGdp) return 10_000_000_000;
    return Math.max(10_000_000_000, Math.floor(provinceGdp * costMultiplier));
  }, [provinceGdp, costMultiplier]);

  const buyerTreasury = humanNation?.treasury || 0;
  const canAfford = buyerTreasury >= purchasePrice;
  const remainingTreasury = Math.max(0, buyerTreasury - purchasePrice);
  const shortageAmount = Math.max(0, purchasePrice - buyerTreasury);

  const isOwnCountry =
    !!humanNation &&
    !!province &&
    CountryRegistry.resolveCanonicalId(humanNation.id) ===
      CountryRegistry.resolveCanonicalId(province.ownerNationId);

  const formattedProvinceName = province
    ? ProvinceNameFormatter.format(province.nameFa)
    : "استان نامشخص";

  const handleExecutePurchase = useCallback(async () => {
    if (
      !humanNation ||
      !province ||
      !ownerNation ||
      isSubmitting ||
      !canAfford ||
      isOwnCountry ||
      isLastProvince ||
      isLastCoastalProvince ||
      !isGeographicallyConnected
    ) {
      return;
    }

    const action = ActionFactory.buyProvince(
      humanNation.id,
      ownerNation.id,
      province.provinceId,
      purchasePrice,
    );

    const res = await dispatchAction(
      action,
      `${formattedProvinceName} با موفقیت از ${ownerNation.name} خریداری و رسماً به قلمرو کشور الحاق شد.`,
    );

    if (res.success) {
      onClose();
    }
  }, [
    humanNation,
    province,
    ownerNation,
    purchasePrice,
    isSubmitting,
    canAfford,
    isOwnCountry,
    isLastProvince,
    isLastCoastalProvince,
    isGeographicallyConnected,
    dispatchAction,
    formattedProvinceName,
    onClose,
  ]);

  return {
    province,
    ownerNation,
    sellerProvincesCount,
    hasSeaAccess,
    isLastProvince,
    isLastCoastalProvince,
    isGeographicallyConnected,
    costMultiplier,
    provinceGdp,
    purchasePrice,
    buyerTreasury,
    canAfford,
    remainingTreasury,
    shortageAmount,
    isOwnCountry,
    formattedProvinceName,
    isSubmitting,
    handleExecutePurchase,
  };
}
