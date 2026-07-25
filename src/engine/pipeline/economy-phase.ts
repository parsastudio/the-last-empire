import { GameState } from "@/domain/game/game-state.schema";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import {
  EconomyStep,
  EconomyStepContext,
} from "./economy/economy-step.interface";
import { AdminBurdenStep } from "./economy/admin-burden.step";
import { ResourceGenerationStep } from "./economy/resource-generation.step";
import { MarketDemandStep } from "./economy/market-demand.step";
import { GdpGrowthStep } from "./economy/gdp-growth.step";
import { PopulationUpdateStep } from "./economy/population-update.step";
import { ManpowerGrowthStep } from "./economy/manpower-growth.step";
import { UpkeepTaxStep } from "./economy/upkeep-tax.step";
import { TradeTariffStep } from "./economy/trade-tariff.step";
import { BankruptcyDeficitStep } from "./economy/bankruptcy-deficit.step";
import { TributeStep } from "./economy/tribute.step";
import { MarketPriceStep } from "./economy/market-price.step";

export class EconomyPhase implements TurnPhase {
  private steps: EconomyStep[] = [
    new AdminBurdenStep(),
    new ResourceGenerationStep(),
    new MarketDemandStep(),
    new GdpGrowthStep(),
    new PopulationUpdateStep(),
    new ManpowerGrowthStep(),
    new UpkeepTaxStep(),
    new TradeTariffStep(),
    new BankruptcyDeficitStep(),
    new TributeStep(),
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
