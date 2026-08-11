import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";

export class AbilityExecutor {
  public static execute(
    state: GameState,
    action: ActivateAbilityAction,
  ): GameState {
    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalSourceId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    const sourceKey = nation.id;
    const updatedNations = { ...state.nations };

    switch (action.abilityType) {
      case "DIPLOMATIC_SUMMIT": {
        const targetId = action.targetNationId
          ? CountryRegistry.resolveCanonicalId(action.targetNationId)
          : undefined;

        const relKey =
          targetId &&
          (nation.relations[targetId] ? targetId : action.targetNationId);
        const rel = relKey ? nation.relations[relKey] : undefined;

        if (!relKey || !rel) {
          throw new GameError("INVALID_ACTION", "Target nation required");
        }

        const updatedRel = { ...rel, opinion: Math.min(100, rel.opinion + 20) };

        const targetNation = updatedNations[relKey];
        if (targetNation) {
          const reverseRelKey = targetNation.relations[sourceKey]
            ? sourceKey
            : nation.id;
          const reverseRel = targetNation.relations[reverseRelKey];
          if (reverseRel) {
            updatedNations[relKey] = {
              ...targetNation,
              relations: {
                ...targetNation.relations,
                [reverseRelKey]: {
                  ...reverseRel,
                  opinion: Math.min(100, reverseRel.opinion + 20),
                },
              },
            };
          }
        }

        const sourceNationCurrent = updatedNations[sourceKey] || nation;
        updatedNations[sourceKey] = {
          ...sourceNationCurrent,
          treasury: sourceNationCurrent.treasury - 20000,
          globalReputation: Math.min(
            100,
            sourceNationCurrent.globalReputation + 10,
          ),
          relations: { ...sourceNationCurrent.relations, [relKey]: updatedRel },
          activeModifiers: [
            ...sourceNationCurrent.activeModifiers,
            {
              id: "cooldown-diplomatic-summit",
              name: "Summit Cooldown",
              effectType: "COOLDOWN",
              magnitude: 0,
              turnsRemaining: 12,
            },
          ],
        };
        break;
      }

      case "MARTIAL_LAW": {
        updatedNations[sourceKey] = {
          ...nation,
          government: {
            ...nation.government,
            stability: Math.min(100, nation.government.stability + 15),
          },
          activeModifiers: [
            ...nation.activeModifiers,
            {
              id: "cooldown-martial-law",
              name: "Martial Law Cooldown",
              effectType: "COOLDOWN",
              magnitude: 0,
              turnsRemaining: 20,
            },
          ],
        };
        break;
      }

      case "INDUSTRIAL_MOBILIZATION": {
        updatedNations[sourceKey] = {
          ...nation,
          government: {
            ...nation.government,
            stability: Math.max(0, nation.government.stability - 15),
          },
          activeModifiers: [
            ...nation.activeModifiers,
            {
              id: "cooldown-industrial-mobilization",
              name: "Mobilization Cooldown",
              effectType: "COOLDOWN",
              magnitude: 0,
              turnsRemaining: 25,
            },
          ],
        };
        break;
      }

      case "ROYAL_DECREE": {
        updatedNations[sourceKey] = {
          ...nation,
          treasury: nation.treasury - 40000,
          globalReputation: Math.min(100, nation.globalReputation + 15),
          activeModifiers: [
            ...nation.activeModifiers,
            {
              id: "cooldown-royal-decree",
              name: "Decree Cooldown",
              effectType: "COOLDOWN",
              magnitude: 0,
              turnsRemaining: 20,
            },
          ],
        };
        break;
      }

      case "WAR_ALERT": {
        updatedNations[sourceKey] = {
          ...nation,
          activeModifiers: [
            ...nation.activeModifiers,
            {
              id: "cooldown-war-alert",
              name: "War Alert Cooldown",
              effectType: "COOLDOWN",
              magnitude: 0,
              turnsRemaining: 20,
            },
          ],
        };
        break;
      }
    }

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
