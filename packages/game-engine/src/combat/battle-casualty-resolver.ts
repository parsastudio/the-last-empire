import { CasualtyMetrics } from "@/domain/reports/combat-report.schema";

export interface CasualtyResolutionInput {
  deployedInfantry: number;
  deployedArmor: number;
  deployedAirForce: number;
  deployedDrones: number;
  attackerNaval: number;
  defInfantry: number;
  defArmor: number;
  defAirDefense: number;
  defAirForce: number;
  defenderNaval: number;
  rawAttInfantryLost: number;
  rawAttArmorLoss: number;
  rawAttAirLoss: number;
  rawDefInfantryLost: number;
  rawDefArmorLost: number;
  rawDefAirDefenseLost: number;
  rawDefAirLoss: number;
  isFullCapitulation: boolean;
}

export interface CasualtyResolutionOutput {
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  netAttInfantryLost: number;
  netAttArmorLost: number;
  netAttAirLost: number;
  netDefInfantryLost: number;
  netDefArmorLost: number;
  netDefAirDefenseLost: number;
  netDefAirLost: number;
}

export class BattleCasualtyResolver {
  public static resolve(
    input: CasualtyResolutionInput,
  ): CasualtyResolutionOutput {
    const netAttInfantryLost = Math.min(
      input.deployedInfantry,
      input.rawAttInfantryLost,
    );
    const netAttArmorLost = Math.min(
      input.deployedArmor,
      input.rawAttArmorLoss,
    );
    const netAttAirLost = Math.min(input.deployedAirForce, input.rawAttAirLoss);

    const netDefInfantryLost = Math.min(
      input.defInfantry,
      input.rawDefInfantryLost,
    );
    const netDefArmorLost = Math.min(input.defArmor, input.rawDefArmorLost);
    const netDefAirDefenseLost = Math.min(
      input.defAirDefense,
      input.rawDefAirDefenseLost,
    );
    const netDefAirLost = Math.min(input.defAirForce, input.rawDefAirLoss);

    const attackerCasualties: CasualtyMetrics = {
      infantryEngaged: input.deployedInfantry,
      infantryLost: netAttInfantryLost,
      armorEngaged: input.deployedArmor,
      armorLost: netAttArmorLost,
      airDefenseEngaged: 0,
      airDefenseLost: 0,
      airForceEngaged: input.deployedAirForce,
      airForceLost: netAttAirLost,
      droneMissileEngaged: input.deployedDrones,
      droneMissileLost: input.deployedDrones,
      navalFleetEngaged: input.attackerNaval,
      navalFleetLost: 0,
    };

    const defenderCasualties: CasualtyMetrics = {
      infantryEngaged: input.defInfantry,
      infantryLost: input.isFullCapitulation
        ? input.defInfantry
        : netDefInfantryLost,
      armorEngaged: input.defArmor,
      armorLost: input.isFullCapitulation ? input.defArmor : netDefArmorLost,
      airDefenseEngaged: input.defAirDefense,
      airDefenseLost: input.isFullCapitulation
        ? input.defAirDefense
        : netDefAirDefenseLost,
      airForceEngaged: input.defAirForce,
      airForceLost: input.isFullCapitulation
        ? input.defAirForce
        : netDefAirLost,
      droneMissileEngaged: 0,
      droneMissileLost: 0,
      navalFleetEngaged: input.defenderNaval,
      navalFleetLost: 0,
    };

    return {
      attackerCasualties,
      defenderCasualties,
      netAttInfantryLost,
      netAttArmorLost,
      netAttAirLost,
      netDefInfantryLost,
      netDefArmorLost,
      netDefAirDefenseLost,
      netDefAirLost,
    };
  }
}
