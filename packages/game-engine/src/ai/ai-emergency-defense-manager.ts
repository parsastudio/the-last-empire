import {
  GameState,
  Nation,
  CountryRegistry,
  MilitaryPowerCalculator,
  MilitaryPricingCalculator,
  MILITARY_UNIT_STATS,
  MilitaryInventoryHelper,
  getNationGdp,
  TurnLogBuilder,
  DebtCalculatorUtility,
} from "@geopolitics/domain";
import { AIArmsSellerMatcher } from "@/engine/ai/procurement/ai-arms-seller-matcher";

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
    const availableLoanHeadroom =
      DebtCalculatorUtility.getAvailableLoanHeadroom(
        defender.nationalDebt,
        defenderGdp,
      );

    if (availableLoanHeadroom <= 0) {
      return { newState: state, defenseEvent: { type: "MAX_DEBT" } };
    }

    const bestSeller = AIArmsSellerMatcher.findBestArmsSeller(
      defender,
      state.nations,
    );
    if (!bestSeller) {
      return { newState: state, defenseEvent: { type: "NO_SELLER" } };
    }

    const bestUnit = MILITARY_UNIT_STATS.ARMOR;

    const unitPrice = Math.floor(
      MilitaryPricingCalculator.calculateUnitTypePrice(bestUnit.type) * 1.5,
    );

    const unitSinglePower = MilitaryPowerCalculator.calculateUnitTypePower(
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
        unitName: bestUnit.type,
      },
    };
  }
}
