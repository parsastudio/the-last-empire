import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import type { ActionHandler } from "./action-handler";
import type { ActiveModifier } from "@/domain/nation/nation.schema";

export class ActivateAbilityActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "ACTIVATE_ABILITY") {
      return state;
    }

    const nationId = action.nationId;
    const nation = state.nations[nationId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    const ability = action.abilityType;

    if (ability === "DIPLOMATIC_SUMMIT") {
      if (nation.government.type !== "DEMOCRACY") {
        throw new GameError(
          "INVALID_ACTION",
          "Only democracies can convene a Diplomatic Summit.",
        );
      }
      if (
        nation.activeModifiers.some(
          (m) => m.id === "cooldown-diplomatic-summit",
        )
      ) {
        throw new GameError(
          "INVALID_ACTION",
          "Diplomatic Summit is on cooldown.",
        );
      }
      if (nation.treasury < 20000) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          "Insufficient treasury to convene summit.",
        );
      }
      const targetId = action.targetNationId;
      if (!targetId) {
        throw new GameError(
          "INVALID_ACTION",
          "Target nation required for Diplomatic Summit.",
        );
      }
      const relation = nation.relations[targetId];
      if (!relation) {
        throw new GameError(
          "NATION_NOT_FOUND",
          "Target nation relations not found.",
        );
      }

      const updatedRelations = {
        ...nation.relations,
        [targetId]: {
          ...relation,
          opinion: Math.min(100, relation.opinion + 20),
        },
      };

      const targetNation = state.nations[targetId];
      const targetRelations = { ...targetNation?.relations };
      if (targetNation && targetRelations[nationId]) {
        targetRelations[nationId] = {
          ...targetRelations[nationId],
          opinion: Math.min(100, targetRelations[nationId].opinion + 20),
        };
      }

      const cooldown: ActiveModifier = {
        id: "cooldown-diplomatic-summit",
        name: "Summit Cooldown",
        effectType: "COOLDOWN",
        magnitude: 0,
        turnsRemaining: 12,
      };

      const updatedNations = { ...state.nations };
      updatedNations[nationId] = {
        ...nation,
        treasury: nation.treasury - 20000,
        globalReputation: Math.min(100, nation.globalReputation + 10),
        relations: updatedRelations,
        activeModifiers: [...nation.activeModifiers, cooldown],
      };

      if (targetNation) {
        updatedNations[targetId] = {
          ...targetNation,
          relations: targetRelations,
        };
      }

      return {
        ...state,
        nations: updatedNations,
      };
    }

    if (ability === "MARTIAL_LAW") {
      if (nation.government.type !== "DICTATORSHIP") {
        throw new GameError(
          "INVALID_ACTION",
          "Only dictatorships can declare Martial Law.",
        );
      }
      if (nation.activeModifiers.some((m) => m.id === "cooldown-martial-law")) {
        throw new GameError("INVALID_ACTION", "Martial Law is on cooldown.");
      }

      const activeMod: ActiveModifier = {
        id: "martial-law-active",
        name: "Martial Law",
        effectType: "STABILITY_DELTA",
        magnitude: 5,
        turnsRemaining: 5,
      };

      const cooldownMod: ActiveModifier = {
        id: "cooldown-martial-law",
        name: "Martial Law Cooldown",
        effectType: "COOLDOWN",
        magnitude: 0,
        turnsRemaining: 20,
      };

      const updatedNations = { ...state.nations };
      updatedNations[nationId] = {
        ...nation,
        government: {
          ...nation.government,
          stability: Math.min(100, nation.government.stability + 15),
        },
        activeModifiers: [...nation.activeModifiers, activeMod, cooldownMod],
      };

      return {
        ...state,
        nations: updatedNations,
      };
    }

    if (ability === "INDUSTRIAL_MOBILIZATION") {
      if (nation.government.type !== "COMMUNISM") {
        throw new GameError(
          "INVALID_ACTION",
          "Only communist regimes can trigger Industrial Mobilization.",
        );
      }
      if (nation.resources.manpower < 50) {
        throw new GameError(
          "INVALID_ACTION",
          "Must have at least 50 manpower to execute Industrial Mobilization.",
        );
      }
      if (
        nation.activeModifiers.some(
          (m) => m.id === "cooldown-industrial-mobilization",
        )
      ) {
        throw new GameError(
          "INVALID_ACTION",
          "Industrial Mobilization is on cooldown.",
        );
      }

      const sacrificedManpower = Math.floor(nation.resources.manpower * 0.15);

      const activeMod: ActiveModifier = {
        id: "industrial-mobilization-active",
        name: "Industrial Mobilization",
        effectType: "GDP_GROWTH_MULT",
        magnitude: 0.05,
        turnsRemaining: 5,
      };

      const cooldown: ActiveModifier = {
        id: "cooldown-industrial-mobilization",
        name: "Mobilization Cooldown",
        effectType: "COOLDOWN",
        magnitude: 0,
        turnsRemaining: 25,
      };

      const updatedNations = { ...state.nations };
      updatedNations[nationId] = {
        ...nation,
        resources: {
          ...nation.resources,
          manpower: nation.resources.manpower - sacrificedManpower,
        },
        government: {
          ...nation.government,
          stability: Math.max(0, nation.government.stability - 15),
        },
        activeModifiers: [...nation.activeModifiers, activeMod, cooldown],
      };

      return {
        ...state,
        nations: updatedNations,
      };
    }

    if (ability === "ROYAL_DECREE") {
      if (nation.government.type !== "MONARCHY") {
        throw new GameError(
          "INVALID_ACTION",
          "Only monarchies can issue a Royal Decree.",
        );
      }
      if (
        nation.activeModifiers.some((m) => m.id === "cooldown-royal-decree")
      ) {
        throw new GameError("INVALID_ACTION", "Royal Decree is on cooldown.");
      }
      if (nation.treasury < 40000) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          "Insufficient treasury to issue decree.",
        );
      }

      const cooldown: ActiveModifier = {
        id: "cooldown-royal-decree",
        name: "Decree Cooldown",
        effectType: "COOLDOWN",
        magnitude: 0,
        turnsRemaining: 20,
      };

      const updatedNations = { ...state.nations };
      updatedNations[nationId] = {
        ...nation,
        treasury: nation.treasury - 40000,
        globalReputation: Math.min(100, nation.globalReputation + 15),
        activeModifiers: [...nation.activeModifiers, cooldown],
      };

      return {
        ...state,
        nations: updatedNations,
      };
    }

    if (ability === "WAR_ALERT") {
      if (nation.government.type !== "FASCISM") {
        throw new GameError(
          "INVALID_ACTION",
          "Only fascist regimes can trigger War Alert.",
        );
      }
      if (nation.activeModifiers.some((m) => m.id === "cooldown-war-alert")) {
        throw new GameError("INVALID_ACTION", "War Alert is on cooldown.");
      }

      const alertDebuff: ActiveModifier = {
        id: "war-alert-active",
        name: "War Alert Mobilization",
        effectType: "GDP_GROWTH_MULT",
        magnitude: -0.15,
        turnsRemaining: 5,
      };

      const cooldown: ActiveModifier = {
        id: "cooldown-war-alert",
        name: "War Alert Cooldown",
        effectType: "COOLDOWN",
        magnitude: 0,
        turnsRemaining: 20,
      };

      const updatedNations = { ...state.nations };
      updatedNations[nationId] = {
        ...nation,
        warExhaustion: Math.max(0, nation.warExhaustion - 30),
        activeModifiers: [...nation.activeModifiers, alertDebuff, cooldown],
      };

      return {
        ...state,
        nations: updatedNations,
      };
    }

    return state;
  }
}
