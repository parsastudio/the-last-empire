import {
  GameState,
  Nation,
  CountryRegistry,
  MilitaryPowerCalculator,
  MilitaryPricingCalculator,
  MILITARY_UNIT_STATS,
  MilitaryInventoryHelper,
  UnitType,
  getNationGdp,
  TurnLogBuilder,
} from "@geopolitics/domain";

export interface ReactiveDefenseEvent {
  type: "PURCHASED" | "NO_SELLER" | "MAX_DEBT" | "NONE";
  sellerName?: string;
  sellerFlagCode?: string;
  cost?: number;
  quantity?: number;
  unitName?: string;
}

export interface ReactiveDefenseResult {
  newState: GameState;
  defenseEvent: ReactiveDefenseEvent;
}

export class AIEmergencyDefenseManager {
  public static handleReactiveDefenseProcurement(
    state: GameState,
    attacker: Nation,
    defender: Nation,
  ): ReactiveDefenseResult {
    if (!defender.isAi || !defender.isAlive || !attacker.isAlive) {
      return { newState: state, defenseEvent: { type: "NONE" } };
    }

    const attackerPower =
      MilitaryPowerCalculator.calculateLandAndAirPower(attacker);
    const defenderPower =
      MilitaryPowerCalculator.calculateLandAndAirPower(defender);

    const targetPower = Math.floor(attackerPower * 1.1);
    if (defenderPower >= targetPower) {
      return { newState: state, defenseEvent: { type: "NONE" } };
    }

    const powerGap = targetPower - defenderPower;
    const defenderGdp = getNationGdp(defender, state.provinces);
    const maxDebtLimit = Math.floor(defenderGdp * 0.8);
    const availableLoanHeadroom = Math.max(
      0,
      maxDebtLimit - defender.nationalDebt,
    );

    if (availableLoanHeadroom <= 0) {
      return { newState: state, defenseEvent: { type: "MAX_DEBT" } };
    }

    const bestSeller = this.findBestArmsSeller(defender, state.nations);
    if (!bestSeller) {
      return { newState: state, defenseEvent: { type: "NO_SELLER" } };
    }

    const bestUnit = this.selectBestPurchasableUnit();
    if (!bestUnit) {
      return { newState: state, defenseEvent: { type: "NO_SELLER" } };
    }

    const unitPrice = Math.floor(
      MilitaryPricingCalculator.calculateUnitTypePrice(bestUnit.type) * 1.5,
    );

    const unitSinglePower = this.calculateSingleUnitPower(
      bestUnit.type,
      bestSeller.military.techLevel,
    );

    if (unitPrice <= 0 || unitSinglePower <= 0) {
      return { newState: state, defenseEvent: { type: "NO_SELLER" } };
    }

    const unitsNeeded = Math.ceil(powerGap / unitSinglePower);
    const totalCost = unitsNeeded * unitPrice;
    const loanToTake = Math.min(availableLoanHeadroom, totalCost);
    const actualQuantity = Math.floor(loanToTake / unitPrice);

    if (actualQuantity <= 0) {
      return { newState: state, defenseEvent: { type: "NO_SELLER" } };
    }

    const finalCost = actualQuantity * unitPrice;
    const sellerProfit = Math.floor(finalCost / 3);

    const updatedMilitary = MilitaryInventoryHelper.addUnits(
      defender.military,
      bestUnit.type,
      actualQuantity,
      bestSeller.military.techLevel,
    );

    const updatedDefender: Nation = {
      ...defender,
      nationalDebt: defender.nationalDebt + finalCost,
      military: updatedMilitary,
    };

    const updatedSeller: Nation = {
      ...bestSeller,
      treasury: bestSeller.treasury + sellerProfit,
    };

    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const isHumanInvolved =
      CountryRegistry.resolveCanonicalId(defender.id) === canonicalHuman ||
      CountryRegistry.resolveCanonicalId(attacker.id) === canonicalHuman;

    const newLogs = [];
    if (isHumanInvolved) {
      newLogs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          defender.id,
          "MILITARY",
          "WARNING",
          "ARMS_TRADE",
          {
            amount: finalCost,
            role: "BUYER",
          },
          bestSeller.id,
        ),
      );
    }

    const nextState: GameState = {
      ...state,
      nations: {
        ...state.nations,
        [defender.id]: updatedDefender,
        [bestSeller.id]: updatedSeller,
      },
      turnLogs: [...state.turnLogs, ...newLogs],
    };

    return {
      newState: nextState,
      defenseEvent: {
        type: "PURCHASED",
        sellerName: bestSeller.name,
        sellerFlagCode: bestSeller.flagCode,
        cost: finalCost,
        quantity: actualQuantity,
        unitName: bestUnit.nameFa,
      },
    };
  }

  private static findBestArmsSeller(
    buyer: Nation,
    nationsMap: Record<string, Nation>,
  ): Nation | null {
    const sellers: Nation[] = [];

    for (const nation of Object.values(nationsMap)) {
      if (!nation.isAlive || nation.id === buyer.id) continue;

      const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);
      const rel =
        nation.relations[canonicalBuyer] || nation.relations[buyer.id];

      const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
      const tension = rel ? (rel.tension ?? 10) : 10;

      if (stance !== "WAR" && tension < 50) {
        sellers.push(nation);
      }
    }

    if (sellers.length === 0) {
      return null;
    }

    sellers.sort((a, b) => b.military.techLevel - a.military.techLevel);
    return sellers[0]!;
  }

  private static selectBestPurchasableUnit(): (typeof MILITARY_UNIT_STATS)[UnitType] {
    return MILITARY_UNIT_STATS.ARMOR;
  }

  private static calculateSingleUnitPower(
    unitType: UnitType,
    techLevel: number,
  ): number {
    const stat = MILITARY_UNIT_STATS[unitType];
    const techMultiplier = 1 + (Math.max(1, techLevel) - 1) * 0.5;
    return stat.weightPower * techMultiplier;
  }
}
