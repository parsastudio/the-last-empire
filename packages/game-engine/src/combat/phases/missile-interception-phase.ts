import {
  DEFAULT_MISSILE_PHASE_CONFIG,
  MissilePhaseConfig,
} from "@/domain/military/missile-phase.config";

export interface MissilePhaseInput {
  deployedDrones: number;
  defAirDefense: number;
  attDroneMult: number;
  defAdMult: number;
  autoInterceptionBonus?: number;
}

export interface MissilePhaseOutput {
  rawDefAirDefenseLost: number;
  defAirDefenseRemainingRaw: number;
  destroyedFactories: number;
  interceptedMissiles: number;
}

interface AirCombatResult {
  intercepted: number;
  penetrated: number;
}

interface SuppressionResult {
  rawDefAirDefenseLost: number;
  defAirDefenseRemainingRaw: number;
  rawSurplusMissiles: number;
}

export class MissileInterceptionPhase {
  public static calculate(
    input: MissilePhaseInput,
    config: MissilePhaseConfig = DEFAULT_MISSILE_PHASE_CONFIG,
  ): MissilePhaseOutput {
    if (input.deployedDrones <= 0) {
      return this.createZeroAttackOutput(input.defAirDefense);
    }

    if (input.defAirDefense <= 0) {
      return this.resolveZeroDefenseScenario(input, config);
    }

    const airCombat = this.resolveAirCombat(input, config);
    const suppression = this.resolveSuppression(
      airCombat.penetrated,
      input,
      config,
    );
    const destroyedFactories = this.calculateDestroyedFactories(
      suppression.rawSurplusMissiles,
      input.deployedDrones,
      config,
    );

    return {
      rawDefAirDefenseLost: suppression.rawDefAirDefenseLost,
      defAirDefenseRemainingRaw: suppression.defAirDefenseRemainingRaw,
      destroyedFactories,
      interceptedMissiles: airCombat.intercepted,
    };
  }

  private static resolveAirCombat(
    input: MissilePhaseInput,
    config: MissilePhaseConfig,
  ): AirCombatResult {
    const attMissilesEff = input.deployedDrones * input.attDroneMult;
    const defAirDefenseEff = input.defAirDefense * input.defAdMult;
    const autoInterceptionBonus = input.autoInterceptionBonus || 0;

    const calculatedBaseRate =
      defAirDefenseEff /
      (defAirDefenseEff + config.attackEffectivenessWeight * attMissilesEff);

    const interceptionRate = Math.max(
      config.minInterceptionRate,
      Math.min(
        config.maxInterceptionRate,
        calculatedBaseRate + autoInterceptionBonus,
      ),
    );

    const intercepted = Math.min(
      input.deployedDrones,
      Math.round(input.deployedDrones * interceptionRate),
    );
    const penetrated = Math.max(0, input.deployedDrones - intercepted);

    return { intercepted, penetrated };
  }

  private static resolveSuppression(
    penetratedDrones: number,
    input: MissilePhaseInput,
    config: MissilePhaseConfig,
  ): SuppressionResult {
    const penetratingPower = penetratedDrones * input.attDroneMult;
    const adSuppressionCostPerUnit =
      config.adSuppressionCostBaseFactor * input.defAdMult;
    const powerNeededToClearAllAD =
      input.defAirDefense * adSuppressionCostPerUnit;

    let rawDefAirDefenseLost = 0;
    let surplusPenetratingPower = 0;

    if (penetratingPower <= powerNeededToClearAllAD) {
      rawDefAirDefenseLost = Math.min(
        input.defAirDefense,
        Math.floor(penetratingPower / adSuppressionCostPerUnit),
      );
      surplusPenetratingPower = 0;
    } else {
      rawDefAirDefenseLost = input.defAirDefense;
      surplusPenetratingPower = penetratingPower - powerNeededToClearAllAD;
    }

    const defAirDefenseRemainingRaw = Math.max(
      0,
      input.defAirDefense - rawDefAirDefenseLost,
    );

    const droneMultiplierDivisor = Math.max(
      config.minDroneMultiplierFloor,
      input.attDroneMult,
    );

    const rawSurplusMissiles = Math.max(
      0,
      Math.floor(surplusPenetratingPower / droneMultiplierDivisor),
    );

    return {
      rawDefAirDefenseLost,
      defAirDefenseRemainingRaw,
      rawSurplusMissiles,
    };
  }

  private static calculateDestroyedFactories(
    surplusMissiles: number,
    deployedDrones: number,
    config: MissilePhaseConfig,
  ): number {
    return Math.min(
      Math.floor(deployedDrones / config.dronesPerFactory),
      Math.floor(surplusMissiles / config.dronesPerFactory),
    );
  }

  private static resolveZeroDefenseScenario(
    input: MissilePhaseInput,
    config: MissilePhaseConfig,
  ): MissilePhaseOutput {
    const autoBonus = input.autoInterceptionBonus || 0;
    const intercepted = Math.min(
      input.deployedDrones,
      Math.round(input.deployedDrones * autoBonus),
    );
    const penetrating = Math.max(0, input.deployedDrones - intercepted);
    const destroyedFactories = Math.floor(
      penetrating / config.dronesPerFactory,
    );

    return {
      rawDefAirDefenseLost: 0,
      defAirDefenseRemainingRaw: 0,
      destroyedFactories,
      interceptedMissiles: intercepted,
    };
  }

  private static createZeroAttackOutput(
    defAirDefense: number,
  ): MissilePhaseOutput {
    return {
      rawDefAirDefenseLost: 0,
      defAirDefenseRemainingRaw: defAirDefense,
      destroyedFactories: 0,
      interceptedMissiles: 0,
    };
  }
}
