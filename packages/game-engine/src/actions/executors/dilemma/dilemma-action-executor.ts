import { GameState } from "@/domain/game/game-state.schema";
import { ResolveDilemmaAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  GameError,
  getNationGdp,
  CORE_DILEMMA_EVENTS,
  MilitaryInventoryHelper,
  UnitType,
  DilemmaEffect,
} from "@geopolitics/domain";
import { ExecutionResult } from "@/engine/actions/execution-result";

const MILITARY_DELTA_MAP: { key: keyof DilemmaEffect; unitType: UnitType }[] = [
  { key: "infantryDelta", unitType: "INFANTRY" },
  { key: "armorDelta", unitType: "ARMOR" },
  { key: "airDefenseDelta", unitType: "AIR_DEFENSE" },
  { key: "airForceDelta", unitType: "AIR_FORCE" },
  { key: "droneMissileDelta", unitType: "DRONE_MISSILE" },
];

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
      throw new GameError("EVENT_NOT_FOUND");
    }

    const choice = event.choices.find((c) => c.id === action.choiceId);
    if (!choice) {
      throw new GameError("INVALID_CHOICE");
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

    for (let i = 0; i < MILITARY_DELTA_MAP.length; i++) {
      const { key, unitType } = MILITARY_DELTA_MAP[i]!;
      const delta = effect[key];
      if (delta) {
        if (delta > 0) {
          updatedMilitary = MilitaryInventoryHelper.addUnits(
            updatedMilitary,
            unitType,
            delta,
            updatedMilitary.techLevel,
          );
        } else {
          updatedMilitary = MilitaryInventoryHelper.removeUnits(
            updatedMilitary,
            unitType,
            Math.abs(delta),
          );
        }
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
