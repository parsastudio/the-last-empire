import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  FundEspionageAction,
  CovertOperationsAction,
} from "@/modules/game-engine/schemas/action.schema";
import { EspionageManager } from "@/modules/diplomacy/domain/espionage-manager";
import { ActionHandler } from "./action-handler";

export class EspionageActionHandler implements ActionHandler {
  private espionageManager = new EspionageManager();

  public execute(state: GameState, action: GameAction): GameState {
    const nations = { ...state.nations };
    const source = nations[action.nationId];

    if (!source) {
      return state;
    }

    if (action.type === "FUND_ESPIONAGE") {
      const fundAction = action as FundEspionageAction;
      const targetId = fundAction.targetNationId;
      const target = nations[targetId];
      if (!target || source.treasury < fundAction.budget) {
        return state;
      }

      const relation = source.relations[targetId];
      if (!relation) {
        return state;
      }

      const strengthGain = Math.floor(fundAction.budget / 800);
      const nextStrength = Math.min(
        100,
        relation.spyNetworkStrength + strengthGain,
      );

      let nextIntel = relation.intelLevel;
      if (nextStrength >= 70) {
        nextIntel = 3;
      } else if (nextStrength >= 40) {
        nextIntel = 2;
      } else if (nextStrength >= 15) {
        nextIntel = 1;
      }

      nations[action.nationId] = {
        ...source,
        treasury: source.treasury - fundAction.budget,
        relations: {
          ...source.relations,
          [targetId]: {
            ...relation,
            spyNetworkStrength: nextStrength,
            intelLevel: nextIntel,
          },
        },
      };

      return {
        ...state,
        nations,
      };
    }

    if (action.type === "COVERT_OPERATIONS") {
      const covertAction = action as CovertOperationsAction;
      const targetId = covertAction.targetNationId;
      const target = nations[targetId];
      if (!target) {
        return state;
      }

      const relation = source.relations[targetId];
      if (!relation || relation.spyNetworkStrength < 20) {
        return state;
      }

      const randomVal = (Math.sin(state.seed) + 1) / 2;
      const opResult = this.espionageManager.calculateOperationSuccess(
        source,
        target,
        relation,
        covertAction.operationType,
        randomVal,
      );

      const updatedTarget = { ...target };
      let updatedSource = { ...source };

      if (opResult.success) {
        if (covertAction.operationType === "SABOTAGE_INDUSTRY") {
          updatedTarget.industrialLevel = Math.max(
            1,
            target.industrialLevel - 1,
          );
        } else if (covertAction.operationType === "INSTIGATE_UNREST") {
          updatedTarget.government = {
            ...target.government,
            stability: Math.max(0, target.government.stability - 25),
          };
        } else if (covertAction.operationType === "MILITARY_INTEL_HEIST") {
          updatedSource = {
            ...updatedSource,
            relations: {
              ...updatedSource.relations,
              [targetId]: {
                ...relation,
                intelLevel: 3,
              },
            },
          };
        }
      }

      const isExposed = randomVal * 100 < opResult.exposureChance;
      if (isExposed) {
        updatedSource.reputation = Math.max(
          -100,
          updatedSource.reputation - 25,
        );
        const sourceRel = updatedSource.relations[targetId];
        const targetRel = updatedTarget.relations[action.nationId];

        if (sourceRel) {
          updatedSource.relations[targetId] = {
            ...sourceRel,
            spyNetworkStrength: 0,
            intelLevel: 0,
            opinion: Math.max(-100, sourceRel.opinion - 40),
          };
        }

        if (targetRel) {
          updatedTarget.relations[action.nationId] = {
            ...targetRel,
            opinion: Math.max(-100, targetRel.opinion - 50),
          };
        }
      } else {
        const sourceRel = updatedSource.relations[targetId];
        if (sourceRel) {
          updatedSource.relations[targetId] = {
            ...sourceRel,
            spyNetworkStrength: Math.max(0, sourceRel.spyNetworkStrength - 15),
          };
        }
      }

      nations[action.nationId] = updatedSource;
      nations[targetId] = updatedTarget;

      return {
        ...state,
        seed: state.seed + 1,
        nations,
      };
    }

    return state;
  }
}
