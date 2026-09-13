import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import {
  Nation,
  GameError,
  NationRelationResolver,
  GeopoliticalReachResolver,
} from "@geopolitics/domain";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";

export class BattleInitiationValidator {
  public static validate(
    state: GameState,
    nation: Nation,
    target: Nation,
    action: InitiateBattleAction,
    canonicalSourceId: string,
    canonicalTargetId: string,
  ): void {
    if (
      action.nationId === action.targetNationId ||
      canonicalSourceId === canonicalTargetId
    ) {
      throw new GameError("CANNOT_ATTACK_SELF");
    }

    if (!target.isAlive) {
      throw new GameError("TARGET_NOT_FOUND");
    }

    const canReach = GeopoliticalReachResolver.canReachForWarOrStrike(
      nation,
      target,
      state.provinces,
    );
    if (!canReach) {
      throw new GameError("GEOPOLITICAL_REACH_DENIED");
    }

    const attackedTargets =
      state.turnActivity?.[nation.id]?.attackedTargetIds ??
      state.turnActivity?.[canonicalSourceId]?.attackedTargetIds ??
      [];
    if (
      attackedTargets.includes(canonicalTargetId) ||
      attackedTargets.includes(action.targetNationId)
    ) {
      throw new GameError("ALREADY_ATTACKED_THIS_TURN");
    }

    const isCurrentWar = NationRelationResolver.isWar(
      nation.relations,
      action.targetNationId,
    );

    if (
      nation.isAi &&
      !isCurrentWar &&
      (nation.postWarCooldownTurns || 0) > 0
    ) {
      throw new GameError("POST_WAR_COOLDOWN");
    }

    if (action.attackType === "NAVAL") {
      const fleetCount = nation.navalFleet || 0;
      const maxCapacityPoints = NavalDeploymentClamper.calculateMaxCapacity(
        "NAVAL",
        fleetCount,
      );
      const infantryCount = action.infantryToDeploy || 0;
      const armorCount = action.armorToDeploy || 0;
      const requiredPoints = NavalDeploymentClamper.calculateRequiredCapacity(
        infantryCount,
        armorCount,
      );

      if (fleetCount <= 0 || requiredPoints > maxCapacityPoints) {
        throw new GameError("INSUFFICIENT_NAVAL_CAPACITY");
      }
    }

    if (nation.military.infantry <= 0) {
      throw new GameError("INFANTRY_REQUIRED");
    }

    if ((action.dronesToLaunch || 0) > (nation.military.droneMissile || 0)) {
      throw new GameError("INSUFFICIENT_RESOURCES");
    }
  }
}
