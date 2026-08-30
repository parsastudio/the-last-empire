import { ArmorClashCalculator } from "@/engine/combat/phases/ground/armor-clash-calculator";
import { InfantryEngagementCalculator } from "@/engine/combat/phases/ground/infantry-engagement-calculator";

export interface GroundEngagementInput {
  deployedArmor: number;
  deployedInfantry: number;
  defInfantry: number;
  defArmorAfterAirRaw: number;
  defArmorAfterAirEff: number;
  defArmorDestroyedByAir: number;
  attArmorMult: number;
  attInfMult: number;
  defArmorMult: number;
  defInfMult: number;
}

export interface GroundEngagementOutput {
  rawAttArmorLoss: number;
  rawDefArmorLost: number;
  rawAttInfantryLost: number;
  rawDefInfantryLost: number;
  isAttackerVictory: boolean;
}

export class GroundEngagementPhase {
  public static calculate(
    input: GroundEngagementInput,
  ): GroundEngagementOutput {
    const armorResult = ArmorClashCalculator.calculateClash(
      input.deployedArmor,
      input.defArmorAfterAirRaw,
      input.defArmorAfterAirEff,
      input.defArmorDestroyedByAir,
      input.defInfantry,
      input.attArmorMult,
      input.defArmorMult,
      input.defInfMult,
    );

    const infantryResult = InfantryEngagementCalculator.calculateEngagement(
      input.deployedInfantry,
      input.defInfantry,
      armorResult.survivingAttArmorEff,
      armorResult.survivingDefArmorEff,
      input.attInfMult,
      input.defInfMult,
    );

    return {
      rawAttArmorLoss: armorResult.rawAttArmorLoss,
      rawDefArmorLost: armorResult.rawDefArmorLost,
      rawAttInfantryLost: infantryResult.rawAttInfantryLost,
      rawDefInfantryLost: infantryResult.rawDefInfantryLost,
      isAttackerVictory: infantryResult.isAttackerVictory,
    };
  }
}
