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
  netDefInfantryLost: number;
  netDefArmorLost: number;
  netDefAirDefenseLost: number;
  netDefAirLost: number;
}

export class BattleCasualtyResolver {
  public static resolve(
    input: CasualtyResolutionInput,
  ): CasualtyResolutionOutput {
    const attInfRecovered = Math.floor(input.rawAttInfantryLost * 0.25);
    const attArmorRecovered = Math.floor(input.rawAttArmorLoss * 0.25);
    const attAirRecovered = Math.floor(input.rawAttAirLoss * 0.25);

    const defInfRecovered = Math.floor(input.rawDefInfantryLost * 0.25);
    const defArmorRecovered = Math.floor(input.rawDefArmorLost * 0.25);
    const defAirDefenseRecovered = Math.floor(
      input.rawDefAirDefenseLost * 0.25,
    );
    const defAirRecovered = Math.floor(input.rawDefAirLoss * 0.25);

    const netAttInfantryLost = input.rawAttInfantryLost - attInfRecovered;
    const netAttArmorLost = input.rawAttArmorLoss - attArmorRecovered;
    const netAttAirLost = input.rawAttAirLoss - attAirRecovered;

    const netDefInfantryLost = input.rawDefInfantryLost - defInfRecovered;
    const netDefArmorLost = input.rawDefArmorLost - defArmorRecovered;
    const netDefAirDefenseLost =
      input.rawDefAirDefenseLost - defAirDefenseRecovered;
    const netDefAirLost = input.rawDefAirLoss - defAirRecovered;

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
      netDefInfantryLost,
      netDefArmorLost,
      netDefAirDefenseLost,
      netDefAirLost,
    };
  }
}
