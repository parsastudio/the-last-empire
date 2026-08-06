import { useCallback, useMemo } from "react";
import { CountryMapping } from "@/domain/map/country-mapping.schema";
import {
  findCountryProfileByCode,
  findCountryProfileById,
  CountryProfile,
} from "@/domain/data/countries";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export type { HoverCountryInfo };

export function resolveStanceLabel(
  humanNationId: string | undefined,
  fullNationId: string,
  countryCode: string,
  nationsMap?: Record<string, Nation>,
): string {
  if (!humanNationId || !nationsMap || !nationsMap[humanNationId]) {
    return "دیپلماسی عادی";
  }

  const humanNation = nationsMap[humanNationId];
  const relation =
    humanNation.relations[fullNationId] ||
    humanNation.relations[countryCode.toUpperCase()];

  if (relation) {
    if (relation.stance === "WAR") return "وضعیت نبرد";
    if (relation.stance === "SEVERED_RELATIONS" || relation.isTradeEmbargoed)
      return "قطع روابط تجاری";
    if (relation.stance === "ALLIANCE") return "متحد استراتژیک";
    if (relation.stance === "NON_AGGRESSION_PACT") return "پیمان عدم تخاصم";
  }

  return "دیپلماسی عادی";
}

interface UseHoverNationResolverProps {
  countries: CountryMapping[];
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useHoverNationResolver({
  countries,
  nationsMap,
  humanNationId,
}: UseHoverNationResolverProps) {
  const profileCacheMap = useMemo(() => {
    const map = new Map<
      number,
      { matchedCountry?: CountryMapping; profile?: CountryProfile }
    >();
    for (const c of countries) {
      const profile =
        findCountryProfileById(c.id) || findCountryProfileByCode(c.code);
      map.set(c.id, { matchedCountry: c, profile });
    }
    return map;
  }, [countries]);

  const resolveHoverInfo = useCallback(
    (nationIdNumber: number, enclaveIdVal: number): HoverCountryInfo | null => {
      let cached = profileCacheMap.get(nationIdNumber);
      if (!cached) {
        const profile = findCountryProfileById(nationIdNumber);
        if (!profile) return null;
        cached = { profile };
      }

      const { matchedCountry, profile } = cached;
      if (!matchedCountry && !profile) return null;

      const countryCode = profile
        ? profile.code.toUpperCase()
        : matchedCountry!.code.toUpperCase();
      const fullNationId = NationIdResolver.resolveCanonicalId(countryCode);

      let liveNation = nationsMap ? nationsMap[fullNationId] : null;

      if (!liveNation && nationsMap) {
        liveNation =
          nationsMap[countryCode] ||
          nationsMap[`NATION_${nationIdNumber}`] ||
          null;
      }

      const realName = liveNation
        ? liveNation.name
        : profile
          ? profile.nameFa
          : matchedCountry!.name;

      const realGdp = liveNation
        ? liveNation.gdp
        : profile
          ? profile.gdp
          : 50000000000;

      const flagCode = profile
        ? profile.flagCode
        : matchedCountry?.code || countryCode;

      const stanceLabel = resolveStanceLabel(
        humanNationId,
        fullNationId,
        countryCode,
        nationsMap,
      );

      const realRank = liveNation ? liveNation.rank : 99;

      let regionLabel = "خاک اصلی";
      let displayPixelCount = liveNation
        ? liveNation.geography.territoryPixelCount
        : profile
          ? Math.round(profile.gdp / 10000000)
          : 4000;

      if (liveNation && liveNation.regionsDemographics) {
        const matchedRegion = liveNation.regionsDemographics.find(
          (r) => r.regionId === enclaveIdVal,
        );
        if (matchedRegion) {
          regionLabel = matchedRegion.name;
          displayPixelCount = matchedRegion.pixelCount;
        } else if (enclaveIdVal > 0) {
          regionLabel = `منطقه فرامرزی ${enclaveIdVal.toLocaleString("fa-IR")}`;
        }
      } else if (enclaveIdVal > 0) {
        regionLabel = `منطقه فرامرزی ${enclaveIdVal.toLocaleString("fa-IR")}`;
      }

      const summary = NationPresentationMapper.formatNationSummary(
        countryCode,
        realName,
        countryCode,
        flagCode,
        realRank,
        realGdp,
        0,
        "DEMOCRACY",
      );

      return {
        name: summary.name,
        code: summary.code,
        flagCode: summary.flagCode,
        rank: summary.rank,
        stance: stanceLabel,
        gdp: summary.gdpText,
        regionName: regionLabel,
        regionPixels:
          NationPresentationMapper.formatTerritoryPixels(displayPixelCount),
      };
    },
    [profileCacheMap, nationsMap, humanNationId],
  );

  return { resolveHoverInfo };
}
