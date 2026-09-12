import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { AppLocale } from "@/presentation/utils/locale-number-formatter";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { ProvinceNameFormatter } from "@/presentation/utils/province-name-formatter";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";

export interface ContextMenuState {
  screenPos: { x: number; y: number };
  provinceId: number;
  provinceName: string;
  countryCode: string;
  countryName: string;
  isOwnCountry: boolean;
}

export function useContextMenu() {
  const currentLocale = useLocale() as AppLocale;
  const locale: AppLocale = currentLocale === "en" ? "en" : "fa";
  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState | null>(null);

  const openContextMenu = useCallback(
    (
      screenX: number,
      screenY: number,
      provinceId: number,
      provincesMap?: Record<string, ProvinceDynamicState>,
      nationsMap?: Record<string, Nation>,
      humanNationId?: string,
    ) => {
      if (provinceId < BitPackedCellUtility.FIRST_PROVINCE_ID) {
        setContextMenuState(null);
        return;
      }

      TacticalSound.playContextMenu();

      const province = provincesMap
        ? provincesMap[provinceId.toString()]
        : null;

      const provinceName = ProvinceNameFormatter.format(provinceId, locale);

      const ownerNationId = province ? province.ownerNationId : "";
      const canonicalOwnerId =
        CountryRegistry.resolveCanonicalId(ownerNationId);
      const ownerNation =
        province && nationsMap
          ? nationsMap[canonicalOwnerId] || nationsMap[ownerNationId]
          : null;

      const countryName = NationPresenter.formatName(
        ownerNation || canonicalOwnerId,
        locale,
      );

      const countryCode = ownerNation
        ? ownerNation.id
        : canonicalOwnerId || "IRN";

      const isOwnCountry =
        !!humanNationId &&
        CountryRegistry.resolveCanonicalId(ownerNationId) ===
          CountryRegistry.resolveCanonicalId(humanNationId);

      setContextMenuState({
        screenPos: { x: screenX, y: screenY },
        provinceId,
        provinceName,
        countryCode,
        countryName,
        isOwnCountry,
      });
    },
    [locale],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenuState(null);
  }, []);

  return {
    contextMenuState,
    openContextMenu,
    closeContextMenu,
  };
}
