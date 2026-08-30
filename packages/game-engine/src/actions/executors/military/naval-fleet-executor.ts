import { GameState } from "@/domain/game/game-state.schema";
import { BuyNavalFleetAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError, NationGettersUtility } from "@geopolitics/domain";

export class NavalFleetExecutor {
  public static readonly FLEET_UNIT_PRICE = 50_000_000_000;

  public static execute(
    state: GameState,
    nation: Nation,
    action: BuyNavalFleetAction,
    sourceKey: string,
  ): GameState {
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

    const fleetCost = this.FLEET_UNIT_PRICE * action.quantity;
    if (nation.treasury < fleetCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای خرید ناوگان دریایی کافی نیست.",
      );
    }

    return {
      ...state,
      nations: {
        ...state.nations,
        [sourceKey]: {
          ...nation,
          treasury: nation.treasury - fleetCost,
          navalFleet: (nation.navalFleet || 0) + action.quantity,
        },
      },
    };
  }
}
