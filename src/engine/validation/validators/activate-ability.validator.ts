import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActivateAbilityAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class ActivateAbilityValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "ACTIVATE_ABILITY";
  }

  public validate(state: GameState, action: GameAction): void {
    const abilityAction = action as ActivateAbilityAction;
    const sourceNation = state.nations[action.nationId];

    if (!sourceNation) {
      throw new GameError("NATION_NOT_FOUND", "Nation does not exist");
    }

    const abilityType = abilityAction.abilityType;

    switch (abilityType) {
      case "DIPLOMATIC_SUMMIT":
        if (sourceNation.government.type !== "DEMOCRACY") {
          throw new GameError(
            "INVALID_ACTION",
            "Only democracies can convene a Diplomatic Summit",
          );
        }
        if (sourceNation.treasury < 20000) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "Insufficient treasury for Diplomatic Summit (20,000 required)",
          );
        }
        if (
          sourceNation.activeModifiers.some(
            (m) => m.id === "cooldown-diplomatic-summit",
          )
        ) {
          throw new GameError(
            "INVALID_ACTION",
            "Diplomatic Summit is on cooldown",
          );
        }
        break;

      case "MARTIAL_LAW":
        if (sourceNation.government.type !== "DICTATORSHIP") {
          throw new GameError(
            "INVALID_ACTION",
            "Only dictatorships can declare Martial Law",
          );
        }
        if (
          sourceNation.activeModifiers.some(
            (m) => m.id === "cooldown-martial-law",
          )
        ) {
          throw new GameError("INVALID_ACTION", "Martial Law is on cooldown");
        }
        break;

      case "INDUSTRIAL_MOBILIZATION":
        if (sourceNation.government.type !== "COMMUNISM") {
          throw new GameError(
            "INVALID_ACTION",
            "Only communist regimes can execute Industrial Mobilization",
          );
        }
        if (sourceNation.resources.manpower < 50) {
          throw new GameError(
            "INSUFFICIENT_RESOURCES",
            "At least 50 manpower required for Industrial Mobilization",
          );
        }
        if (
          sourceNation.activeModifiers.some(
            (m) => m.id === "cooldown-industrial-mobilization",
          )
        ) {
          throw new GameError(
            "INVALID_ACTION",
            "Industrial Mobilization is on cooldown",
          );
        }
        break;

      case "ROYAL_DECREE":
        if (sourceNation.government.type !== "MONARCHY") {
          throw new GameError(
            "INVALID_ACTION",
            "Only monarchies can issue a Royal Decree",
          );
        }
        if (sourceNation.treasury < 40000) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "Insufficient treasury for Royal Decree (40,000 required)",
          );
        }
        if (
          sourceNation.activeModifiers.some(
            (m) => m.id === "cooldown-royal-decree",
          )
        ) {
          throw new GameError("INVALID_ACTION", "Royal Decree is on cooldown");
        }
        break;

      case "WAR_ALERT":
        if (sourceNation.government.type !== "FASCISM") {
          throw new GameError(
            "INVALID_ACTION",
            "Only fascist regimes can declare War Alert",
          );
        }
        if (
          sourceNation.activeModifiers.some(
            (m) => m.id === "cooldown-war-alert",
          )
        ) {
          throw new GameError("INVALID_ACTION", "War Alert is on cooldown");
        }
        break;
    }
  }
}
