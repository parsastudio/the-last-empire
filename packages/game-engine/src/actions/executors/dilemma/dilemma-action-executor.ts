import { GameState } from "@/domain/game/game-state.schema";
import { ResolveDilemmaAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import {
  CORE_DILEMMA_EVENTS,
  MilitaryInventoryHelper,
} from "@geopolitics/domain";

export class DilemmaActionExecutor {
  public static execute(
    state: GameState,
    action: ResolveDilemmaAction,
    nation: Nation,
    buyerKey: string,
  ): { newState: GameState; resultData: unknown } {
    const event = CORE_DILEMMA_EVENTS.find((e) => e.id === action.eventId);
    if (!event) {
      throw new GameError("INVALID_ACTION", "رویداد مورد نظر یافت نشد.");
    }

    const choice = event.choices.find((c) => c.id === action.choiceId);
    if (!choice) {
      throw new GameError("INVALID_ACTION", "گزینه انتخابی نامعتبر است.");
    }

    const effect = choice.effect;

    const nextTreasury = Math.max(
      0,
      nation.treasury + (effect.treasuryDelta || 0),
    );

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

    const resolutionLog = TurnLogBuilder.createNationalLog(
      state.currentTurn,
      nation.id,
      "DOMESTIC",
      "INFO",
      "DILEMMA_RESOLVED",
      {
        eventTitle: event.titleFa,
        choiceLabel: choice.labelFa,
      },
      undefined,
      `فرمان حاکمیت در خصوص رویداد «${event.titleFa}»: ${choice.labelFa}`,
    );

    const newState: GameState = {
      ...state,
      activeDilemma: null,
      nations: {
        ...state.nations,
        [buyerKey]: updatedNation,
      },
      turnLogs: [...state.turnLogs, resolutionLog],
    };

    return {
      newState,
      resultData: {
        eventId: event.id,
        choiceId: choice.id,
        eventTitle: event.titleFa,
        choiceLabel: choice.labelFa,
      },
    };
  }
}
