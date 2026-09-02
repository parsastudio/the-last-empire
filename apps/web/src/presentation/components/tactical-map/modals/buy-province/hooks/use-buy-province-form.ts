import { useMemo, useCallback } from "react";
import {
  Nation,
  Province,
  ActionFactory,
  ProvinceTradeValidator,
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

  const validation = useMemo(() => {
    if (!humanNation || !ownerNation || !province) return null;
    return ProvinceTradeValidator.validate(
      humanNation,
      ownerNation,
      province,
      provincesMap,
      nationsMap,
    );
  }, [humanNation, ownerNation, province, provincesMap, nationsMap]);

  const buyerTreasury = humanNation?.treasury || 0;
  const purchasePrice = validation?.purchasePrice || 10_000_000_000;
  const remainingTreasury = Math.max(0, buyerTreasury - purchasePrice);

  const formattedProvinceName = province
    ? ProvinceNameFormatter.format(province.nameFa)
    : "استان نامشخص";

  const handleExecutePurchase = useCallback(async () => {
    if (
      !humanNation ||
      !province ||
      !ownerNation ||
      isSubmitting ||
      !validation?.isValid
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
    validation,
    dispatchAction,
    formattedProvinceName,
    onClose,
  ]);

  return {
    province,
    ownerNation,
    validation,
    purchasePrice,
    buyerTreasury,
    remainingTreasury,
    formattedProvinceName,
    isSubmitting,
    handleExecutePurchase,
  };
}
