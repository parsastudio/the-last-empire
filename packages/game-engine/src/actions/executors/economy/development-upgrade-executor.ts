import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class DevelopmentUpgradeExecutor {
  public static execute(
    state: GameState,
    nation: Nation,
    canonicalNationId: string,
    buyerKey: string,
  ): GameState {
    const cost = DevelopmentManager.getUpgradeCost(
      getNationGdp(nation, state.provinces),
    );
    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای اجرای طرح جامع توسعه ملی کافی نیست.",
      );
    }

    const updatedProvinces: Record<string, Province> = {
      ...state.provinces,
    };

    for (const prov of Object.values(state.provinces)) {
      const canonicalOwner = CountryRegistry.resolveCanonicalId(
        prov.ownerNationId,
      );
      if (canonicalOwner === canonicalNationId) {
        const nextCap = DevelopmentManager.calculateNextCapacity(
          prov.maxPopulationCapacity,
        );
        const nextProd = DevelopmentManager.calculateNextProductivity(
          prov.perCapitaProductivity,
        );
        const updatedProv: Province = {
          ...prov,
          maxPopulationCapacity: nextCap,
          perCapitaProductivity: nextProd,
        };
        updatedProvinces[prov.provinceId.toString()] = updatedProv;
      }
    }

    const nextLevel = nation.industrialLevel + 1;

    return {
      ...state,
      provinces: updatedProvinces,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - cost,
          industrialLevel: nextLevel,
        },
      },
    };
  }
}
