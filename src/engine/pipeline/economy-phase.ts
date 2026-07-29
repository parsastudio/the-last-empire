import { GameState } from "@/domain/game/game-state.schema";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import {
  EconomyStep,
  EconomyStepContext,
} from "./economy/economy-step.interface";
import { MacroEconomyStepGroup } from "./economy/macro-economy-step-group";
import { MarketTradeStepGroup } from "./economy/market-trade-step-group";

export class EconomyPhase implements TurnPhase {
  private stepGroups: EconomyStep[] = [
    new MacroEconomyStepGroup(),
    new MarketTradeStepGroup(),
  ];

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const tradeVolume = nextState.turnTradeVolume ?? {
      oilBought: 0,
      oilSold: 0,
      steelBought: 0,
      steelSold: 0,
    };

    const economyContext: EconomyStepContext = {
      state: nextState,
      prng: context.prng,
      totalOilDemand: tradeVolume.oilBought,
      totalOilSupply: tradeVolume.oilSold,
      totalSteelDemand: tradeVolume.steelBought,
      totalSteelSupply: tradeVolume.steelSold,
    };

    for (const group of this.stepGroups) {
      group.execute(economyContext);
    }

    return economyContext.state;
  }
}
