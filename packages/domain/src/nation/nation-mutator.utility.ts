import { Nation } from "@/domain/nation/nation.schema";

export class NationMutatorUtility {
  public static createDefeatedNation(nation: Nation): Nation {
    return {
      ...nation,
      isAlive: false,
      treasury: 0,
      nationalDebt: 0,
      warFocusTargetId: null,
      executedEspionageTiers: [],
      attackedTargetIdsThisTurn: [],
      sentAidTargetIdsThisTurn: [],
      boostedProjectIdsThisTurn: [],
      projectProgressSteps: {},
      postWarCooldownTurns: 0,
      defenseGuarantorIds: [],
      securityGuarantorId: null,
      isEmergencyProtectorate: false,
      military: {
        ...nation.military,
        infantry: 0,
        armor: 0,
        airDefense: 0,
        airForce: 0,
        droneMissile: 0,
      },
      relations: {},
    };
  }
}
