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
      throw new GameError(
        "INVALID_ACTION",
        "امکان تهاجم به کشور خودی وجود ندارد.",
      );
    }

    if (!target.isAlive) {
      throw new GameError("NATION_NOT_FOUND", "کشور هدف فعال و زنده نیست.");
    }

    const canReach = GeopoliticalReachResolver.canReachForWarOrStrike(
      nation,
      target,
      state.provinces,
    );
    if (!canReach) {
      throw new GameError(
        "GEOPOLITICAL_REACH_DENIED",
        "امکان آغاز عملیات تهاجم وجود ندارد: عدم وجود مرز زمینی یا عدم دسترسی به آب‌های آزاد با ناوگان دریایی.",
      );
    }

    const attackedTargets =
      state.turnActivity?.[nation.id]?.attackedTargetIds ??
      state.turnActivity?.[canonicalSourceId]?.attackedTargetIds ??
      [];
    if (
      attackedTargets.includes(canonicalTargetId) ||
      attackedTargets.includes(action.targetNationId)
    ) {
      throw new GameError(
        "INVALID_ACTION",
        `در هر نوبت تنها یک بار امکان تهاجم نظامی علیه کشور ${target.id} وجود دارد. برای تهاجم مجدد باید نوبت را به پایان برسانید.`,
      );
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
      throw new GameError(
        "INVALID_ACTION",
        "امکان آغاز تهاجم نظامی جدید وجود ندارد: کشور در دوره سردسازی پس از جنگ قرار دارد.",
      );
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
        throw new GameError(
          "INVALID_ACTION",
          "ظرفیت ترابری ناوگان دریایی شما برای حمل این حجم از ادوات زمینی کافی نیست.",
        );
      }
    }

    if (nation.military.infantry <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "برای آغاز تهاجم حداقل به ۱ یگان پیاده‌نظام نیاز است.",
      );
    }

    if ((action.dronesToLaunch || 0) > (nation.military.droneMissile || 0)) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "تعداد پهپادهای درخواستی بیشتر از موجودی زرادخانه کشور است.",
      );
    }
  }
}
