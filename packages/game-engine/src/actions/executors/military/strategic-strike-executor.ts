import { GameState } from "@/domain/game/game-state.schema";
import { StrategicIndustrialStrikeAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  GameError,
  CountryRegistry,
  GeopoliticalReachResolver,
  TurnLogBuilder,
} from "@geopolitics/domain";

export class StrategicStrikeExecutor {
  public static execute(
    state: GameState,
    action: StrategicIndustrialStrikeAction,
    attacker: Nation,
    target: Nation,
  ): { newState: GameState; resultData: unknown } {
    if (action.dronesToLaunch <= 0) {
      throw new GameError("INVALID_ACTION", "تعداد موشک/پهپاد باید مثبت باشد.");
    }

    if (attacker.military.droneMissile < action.dronesToLaunch) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "تعداد پرتابه‌های درخواستی از موجودی انبار بیشتر است.",
      );
    }

    const canReach = GeopoliticalReachResolver.canReachForWarOrStrike(
      attacker,
      target,
      state.provinces,
    );
    if (!canReach) {
      throw new GameError(
        "GEOPOLITICAL_REACH_DENIED",
        "امکان اجرای ضربت موشکی به دلیل عدم دسترسی مرزی یا دریایی وجود ندارد.",
      );
    }

    const prov = state.provinces[action.targetProvinceId.toString()];
    if (!prov) {
      throw new GameError("PROVINCE_NOT_FOUND", "استان هدف یافت نشد.");
    }

    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
    if (
      CountryRegistry.resolveCanonicalId(prov.ownerNationId) !== targetCanonical
    ) {
      throw new GameError(
        "INVALID_TARGET",
        "استان هدف متعلق به کشور متخاصم نیست.",
      );
    }

    const drones = action.dronesToLaunch;
    const defAirDefense = target.military.airDefense || 0;

    const intercepted = Math.min(drones, defAirDefense * 2);
    const leaked = Math.max(0, drones - intercepted);

    const destroyedFactories = Math.min(
      prov.factoriesCount,
      Math.floor(leaked * 0.5),
    );

    const updatedProv = {
      ...prov,
      factoriesCount: Math.max(0, prov.factoriesCount - destroyedFactories),
    };

    const newAttackerMilitary = {
      ...attacker.military,
      droneMissile: attacker.military.droneMissile - drones,
    };

    const strikeLog = TurnLogBuilder.createNationalLog(
      state.currentTurn,
      attacker.id,
      "MILITARY",
      destroyedFactories > 0 ? "INFO" : "WARNING",
      "BATTLE_TACTICAL_REPORT",
      {
        humanHeadline: `عملیات ضربت موشکی به ${prov.nameFa}: ${destroyedFactories} کارخانه منهدم گردید.`,
        intercepted,
        destroyedFactories,
      },
      target.id,
    );

    const newState: GameState = {
      ...state,
      turnLogs: [...state.turnLogs, strikeLog],
      provinces: {
        ...state.provinces,
        [prov.provinceId.toString()]: updatedProv,
      },
      nations: {
        ...state.nations,
        [attacker.id]: {
          ...attacker,
          military: newAttackerMilitary,
        },
      },
    };

    return {
      newState,
      resultData: {
        dronesLaunched: drones,
        intercepted,
        leaked,
        destroyedFactories,
        targetProvinceName: prov.nameFa,
      },
    };
  }
}
