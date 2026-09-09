import { GameState } from "@/domain/game/game-state.schema";
import { BuyNavalFleetAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  GameError,
  NationGettersUtility,
  NAVAL_FLEET_CONFIG,
} from "@geopolitics/domain";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class NavalFleetExecutor {
  public static execute(
    state: GameState,
    nation: Nation,
    action: BuyNavalFleetAction,
    sourceKey: string,
  ): ExecutionResult<{ quantity: number; cost: number; totalFleet: number }> {
    const hasSea = NationGettersUtility.hasSeaAccess(
      nation.id,
      state.provinces,
    );

    if (!hasSea) {
      throw new GameError(
        "INVALID_ACTION",
        "کشور شما به آب‌های آزاد دسترسی ندارد و امکان تجهیز ناوگان دریایی وجود ندارد.",
      );
    }

    const fleetCost = NAVAL_FLEET_CONFIG.FLEET_UNIT_COST * action.quantity;
    if (nation.treasury < fleetCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای خرید ناوگان دریایی کافی نیست.",
      );
    }

    const nextFleet = (nation.navalFleet || 0) + action.quantity;

    const newState: GameState = {
      ...state,
      nations: {
        ...state.nations,
        [sourceKey]: {
          ...nation,
          treasury: nation.treasury - fleetCost,
          navalFleet: nextFleet,
        },
      },
    };

    return {
      newState,
      resultData: {
        quantity: action.quantity,
        cost: fleetCost,
        totalFleet: nextFleet,
      },
    };
  }
}
