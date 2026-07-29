import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { AdminBurdenStep } from "./admin-burden.step";
import { ResourceGenerationStep } from "./resource-generation.step";
import { GdpGrowthStep } from "./gdp-growth.step";
import { PopulationUpdateStep } from "./population-update.step";
import { ManpowerGrowthStep } from "./manpower-growth.step";
import { UpkeepTaxStep } from "./upkeep-tax.step";
import { BankruptcyDeficitStep } from "./bankruptcy-deficit.step";

export class MacroEconomyStepGroup implements EconomyStep {
  private steps: EconomyStep[] = [
    new AdminBurdenStep(),
    new ResourceGenerationStep(),
    new GdpGrowthStep(),
    new PopulationUpdateStep(),
    new ManpowerGrowthStep(),
    new UpkeepTaxStep(),
    new BankruptcyDeficitStep(),
  ];

  public execute(context: EconomyStepContext): void {
    for (const step of this.steps) {
      step.execute(context);
    }
  }
}
