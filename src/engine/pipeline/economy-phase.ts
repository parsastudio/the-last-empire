import { GameState } from "@/domain/game/game-state.schema";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import {
  EconomyStep,
  EconomyStepContext,
} from "./economy/economy-step.interface";
import { ResourceGenerationStep } from "./economy/resource-generation.step";
import { GdpGrowthStep } from "./economy/gdp-growth.step";
import { PopulationUpdateStep } from "./economy/population-update.step";
import { ManpowerGrowthStep } from "./economy/manpower-growth.step";
import { TradeTariffStep } from "./economy/trade-tariff.step";
import { AutoTradeStep } from "./economy/auto-trade.step";
import { UpkeepTaxStep } from "./economy/upkeep-tax.step";
import { BankruptcyDeficitStep } from "./economy/bankruptcy-deficit.step";
import { MarketPriceStep } from "./economy/market-price.step";

export class EconomyPhase implements TurnPhase {
  private steps: EconomyStep[] = [
    new ResourceGenerationStep(),
    new GdpGrowthStep(),
    new PopulationUpdateStep(),
    new ManpowerGrowthStep(),
    new TradeTariffStep(),
    new AutoTradeStep(),
    new UpkeepTaxStep(),
    new BankruptcyDeficitStep(),
    new MarketPriceStep(),
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

    for (const step of this.steps) {
      step.execute(economyContext);
    }

    return economyContext.state;
  }
}
