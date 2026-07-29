import { MilitaryStack } from "@/domain/military/military.schema";

export interface DetailedCasualtyResult {
  attackerLostStack: MilitaryStack;
  defenderLostStack: MilitaryStack;
  attackerRetreatedStack: MilitaryStack;
  defenderRetreatedStack: MilitaryStack;
  attackerTotalLossPoints: number;
  defenderTotalLossPoints: number;
}

export class CombatCasualtyCalculator {
  public calculateDetailedCasualties(
    attackerMilitary: MilitaryStack,
    defenderMilitary: MilitaryStack,
    attackerEngagedPower: number,
    defenderEngagedPower: number,
    isAttackerVictory: boolean,
    isFullTerritoryCaptured = false,
  ): DetailedCasualtyResult {
    if (attackerEngagedPower <= 0 || defenderEngagedPower <= 0) {
      return {
        attackerLostStack: {
          infantry: 0,
          airForce: 0,
          droneMissile: 0,
          experience: attackerMilitary.experience,
          techLevel: attackerMilitary.techLevel,
        },
        defenderLostStack: {
          infantry: 0,
          airForce: 0,
          droneMissile: 0,
          experience: defenderMilitary.experience,
          techLevel: defenderMilitary.techLevel,
        },
        attackerRetreatedStack: { ...attackerMilitary },
        defenderRetreatedStack: { ...defenderMilitary },
        attackerTotalLossPoints: 0,
        defenderTotalLossPoints: 0,
      };
    }

    const smallerForce = Math.min(attackerEngagedPower, defenderEngagedPower);

    let attackerLossPoints = 0;
    let defenderLossPoints = 0;

    if (isAttackerVictory) {
      if (isFullTerritoryCaptured) {
        defenderLossPoints = defenderEngagedPower;
        attackerLossPoints = Math.floor(smallerForce * 0.35);
      } else {
        const rawDefenderLoss = Math.floor(smallerForce * 0.35);
        const maxAllowedDefenderLoss = Math.floor(defenderEngagedPower * 0.4);
        defenderLossPoints = Math.min(rawDefenderLoss, maxAllowedDefenderLoss);
        attackerLossPoints = Math.floor(smallerForce * 0.45);
      }
    } else {
      attackerLossPoints = Math.floor(smallerForce * 0.55);
      defenderLossPoints = Math.floor(smallerForce * 0.15);
    }

    const attackerRatio = Math.min(
      1.0,
      attackerLossPoints / Math.max(1, attackerEngagedPower),
    );
    const defenderRatio =
      isFullTerritoryCaptured && isAttackerVictory
        ? 1.0
        : Math.min(0.4, defenderLossPoints / Math.max(1, defenderEngagedPower));

    const attackerInfantryLost = Math.min(
      attackerMilitary.infantry,
      Math.floor(attackerMilitary.infantry * attackerRatio),
    );
    const attackerAirLost = Math.min(
      attackerMilitary.airForce,
      Math.floor(attackerMilitary.airForce * attackerRatio),
    );
    const attackerDroneLost = Math.min(
      attackerMilitary.droneMissile,
      Math.floor(attackerMilitary.droneMissile * attackerRatio),
    );

    const defenderInfantryLost = Math.min(
      defenderMilitary.infantry,
      Math.floor(defenderMilitary.infantry * defenderRatio),
    );
    const defenderAirLost = Math.min(
      defenderMilitary.airForce,
      Math.floor(defenderMilitary.airForce * defenderRatio),
    );
    const defenderDroneLost = Math.min(
      defenderMilitary.droneMissile,
      Math.floor(defenderMilitary.droneMissile * defenderRatio),
    );

    return {
      attackerLostStack: {
        infantry: attackerInfantryLost,
        airForce: attackerAirLost,
        droneMissile: attackerDroneLost,
        experience: attackerMilitary.experience,
        techLevel: attackerMilitary.techLevel,
      },
      defenderLostStack: {
        infantry: defenderInfantryLost,
        airForce: defenderAirLost,
        droneMissile: defenderDroneLost,
        experience: defenderMilitary.experience,
        techLevel: defenderMilitary.techLevel,
      },
      attackerRetreatedStack: {
        infantry: Math.max(0, attackerMilitary.infantry - attackerInfantryLost),
        airForce: Math.max(0, attackerMilitary.airForce - attackerAirLost),
        droneMissile: Math.max(
          0,
          attackerMilitary.droneMissile - attackerDroneLost,
        ),
        experience: attackerMilitary.experience,
        techLevel: attackerMilitary.techLevel,
      },
      defenderRetreatedStack: {
        infantry: Math.max(0, defenderMilitary.infantry - defenderInfantryLost),
        airForce: Math.max(0, defenderMilitary.airForce - defenderAirLost),
        droneMissile: Math.max(
          0,
          defenderMilitary.droneMissile - defenderDroneLost,
        ),
        experience: defenderMilitary.experience,
        techLevel: defenderMilitary.techLevel,
      },
      attackerTotalLossPoints: attackerLossPoints,
      defenderTotalLossPoints: defenderLossPoints,
    };
  }
}
