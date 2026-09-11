import { GameState } from "@/domain/game/game-state.schema";
import { ResolveDilemmaAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError, getNationGdp } from "@geopolitics/domain";
import {
  CORE_DILEMMA_EVENTS,
  MilitaryInventoryHelper,
} from "@geopolitics/domain";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class DilemmaActionExecutor {
  public static execute(
    state: GameState,
    action: ResolveDilemmaAction,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult<{
    eventId: string;
    choiceId: string;
    eventTitle: string;
    choiceLabel: string;
  }> {
    const event = CORE_DILEMMA_EVENTS.find((e) => e.id === action.eventId);
    if (!event) {
      throw new GameError("INVALID_ACTION", "رویداد مورد نظر یافت نشد.");
    }

    const choice = event.choices.find((c) => c.id === action.choiceId);
    if (!choice) {
      throw new GameError("INVALID_ACTION", "گزینه انتخابی نامعتبر است.");
    }

    const effect = choice.effect;
    const nationGdp = getNationGdp(nation, state.provinces);

    let effectiveTreasuryDelta = effect.treasuryDelta || 0;
    if (
      effect.treasuryGdpPercent !== undefined &&
      effect.treasuryGdpPercent !== 0
    ) {
      effectiveTreasuryDelta = Math.floor(
        nationGdp * effect.treasuryGdpPercent,
      );
    }

    const nextTreasury = Math.max(0, nation.treasury + effectiveTreasuryDelta);

    const nextStability = Math.max(
      0,
      Math.min(100, nation.government.stability + (effect.stabilityDelta || 0)),
    );

    const nextReputation = Math.max(
      -100,
      Math.min(
        100,
        nation.globalReputation + (effect.globalReputationDelta || 0),
      ),
    );

    const nextIndustrialLevel = Math.max(
      1.0,
      Number(
        (nation.industrialLevel + (effect.industrialLevelDelta || 0)).toFixed(
          2,
        ),
      ),
    );

    let updatedMilitary = nation.military;

    if (effect.militaryTechDelta && effect.militaryTechDelta > 0) {
      const nextTech = Number(
        (updatedMilitary.techLevel + effect.militaryTechDelta).toFixed(1),
      );
      updatedMilitary = MilitaryInventoryHelper.syncBranchTechOnUpgrade(
        updatedMilitary,
        nextTech,
      );
    }

    if (effect.infantryDelta) {
      if (effect.infantryDelta > 0) {
        updatedMilitary = MilitaryInventoryHelper.addUnits(
          updatedMilitary,
          "INFANTRY",
          effect.infantryDelta,
          updatedMilitary.techLevel,
        );
      } else {
        updatedMilitary = MilitaryInventoryHelper.removeUnits(
          updatedMilitary,
          "INFANTRY",
          Math.abs(effect.infantryDelta),
        );
      }
    }

    if (effect.armorDelta) {
      if (effect.armorDelta > 0) {
        updatedMilitary = MilitaryInventoryHelper.addUnits(
          updatedMilitary,
          "ARMOR",
          effect.armorDelta,
          updatedMilitary.techLevel,
        );
      } else {
        updatedMilitary = MilitaryInventoryHelper.removeUnits(
          updatedMilitary,
          "ARMOR",
          Math.abs(effect.armorDelta),
        );
      }
    }

    if (effect.airDefenseDelta) {
      if (effect.airDefenseDelta > 0) {
        updatedMilitary = MilitaryInventoryHelper.addUnits(
          updatedMilitary,
          "AIR_DEFENSE",
          effect.airDefenseDelta,
          updatedMilitary.techLevel,
        );
      } else {
        updatedMilitary = MilitaryInventoryHelper.removeUnits(
          updatedMilitary,
          "AIR_DEFENSE",
          Math.abs(effect.airDefenseDelta),
        );
      }
    }

    if (effect.airForceDelta) {
      if (effect.airForceDelta > 0) {
        updatedMilitary = MilitaryInventoryHelper.addUnits(
          updatedMilitary,
          "AIR_FORCE",
          effect.airForceDelta,
          updatedMilitary.techLevel,
        );
      } else {
        updatedMilitary = MilitaryInventoryHelper.removeUnits(
          updatedMilitary,
          "AIR_FORCE",
          Math.abs(effect.airForceDelta),
        );
      }
    }

    if (effect.droneMissileDelta) {
      if (effect.droneMissileDelta > 0) {
        updatedMilitary = MilitaryInventoryHelper.addUnits(
          updatedMilitary,
          "DRONE_MISSILE",
          effect.droneMissileDelta,
          updatedMilitary.techLevel,
        );
      } else {
        updatedMilitary = MilitaryInventoryHelper.removeUnits(
          updatedMilitary,
          "DRONE_MISSILE",
          Math.abs(effect.droneMissileDelta),
        );
      }
    }

    const updatedNation: Nation = {
      ...nation,
      treasury: nextTreasury,
      globalReputation: nextReputation,
      industrialLevel: nextIndustrialLevel,
      military: updatedMilitary,
      government: {
        ...nation.government,
        stability: nextStability,
      },
    };

    const newState: GameState = {
      ...state,
      activeDilemma: null,
      nations: {
        ...state.nations,
        [buyerKey]: updatedNation,
      },
      turnLogs: state.turnLogs,
    };

    return {
      newState,
      resultData: {
        eventId: event.id,
        choiceId: choice.id,
        eventTitle: event.id,
        choiceLabel: choice.id,
      },
    };
  }
}
