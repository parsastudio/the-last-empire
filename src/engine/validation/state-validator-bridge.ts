import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { LoanManager } from "@/engine/economy/loan-manager";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";
import { ConquestActionValidator } from "@/engine/combat/validation/conquest-action-validator";

export class StateValidator {
  private loanManager = new LoanManager();
  private resourceDependencyManager = new ResourceDependencyManager();
  private conquestValidator = new ConquestActionValidator();

  public validateAction(state: GameState, action: GameAction): void {
    if (state.isGameOver) {
      throw new GameError(
        "STATE_FROZEN",
        "Cannot execute actions after game over",
      );
    }

    const sourceNation = state.nations[action.nationId];
    if (!sourceNation || !sourceNation.isAlive) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `Nation ID ${action.nationId} is not alive or does not exist`,
      );
    }

    if ("targetNationId" in action && action.targetNationId) {
      const targetNation = state.nations[action.targetNationId];
      if (!targetNation || !targetNation.isAlive) {
        throw new GameError(
          "NATION_NOT_FOUND",
          `Target nation ID ${action.targetNationId} is not alive or does not exist`,
        );
      }
    }

    if (action.type === "SET_TAX_RATE") {
      if (action.newRate < 0 || action.newRate > 100) {
        throw new GameError(
          "INVALID_ACTION",
          "Tax rate must be between 0 and 100",
        );
      }
    }

    if (action.type === "RECRUIT_UNIT") {
      if (action.quantity <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Recruitment quantity must be greater than zero",
        );
      }
      this.resourceDependencyManager.validateUnitRecruitmentResources(
        sourceNation,
        action.unitType,
        action.quantity,
      );
    }

    if (action.type === "FUND_PROXY_INFLUENCE") {
      if (action.budget <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Proxy war budget must be positive",
        );
      }
      if (sourceNation.treasury < action.budget) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          "Insufficient funds to sponsor proxy influence",
        );
      }
    }

    if (action.type === "UNLOCK_DOCTRINE") {
      if (sourceNation.doctrines.doctrinePoints < 3) {
        throw new GameError(
          "INVALID_ACTION",
          "Insufficient doctrine points to unlock doctrines",
        );
      }
    }

    if (action.type === "DISBAND_UNIT") {
      if (action.quantity <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Disband quantity must be greater than zero",
        );
      }
      const currentCount =
        action.unitType === "INFANTRY"
          ? sourceNation.military.infantry
          : action.unitType === "AIR_FORCE"
            ? sourceNation.military.airForce
            : sourceNation.military.droneMissile;

      if (currentCount < action.quantity) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot disband more units than available in the military stack",
        );
      }
    }

    if (action.type === "REQUEST_LOAN") {
      if (action.amount <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Requested loan amount must be positive",
        );
      }
      const hasBankruptcyHoliday = sourceNation.activeModifiers.some(
        (m) => m.id === "bankruptcy-debt-holiday",
      );
      if (hasBankruptcyHoliday) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot request loans while under Bankruptcy Restructuring Period",
        );
      }
      const creditRating = this.loanManager.calculateCreditRating(sourceNation);
      const effectiveTaxRateForCredit = Math.min(20, sourceNation.taxRate);
      const taxIncome = sourceNation.gdp * (effectiveTaxRateForCredit / 100);
      const maxDebtLimit = Math.min(
        Math.floor(sourceNation.gdp * 0.2 * (creditRating / 100)),
        Math.floor(taxIncome * 5 * (creditRating / 100)),
      );
      const availableCredit = Math.max(
        0,
        maxDebtLimit - sourceNation.nationalDebt,
      );
      const totalRepayable = action.amount + Math.floor(action.amount * 0.05);
      if (totalRepayable > availableCredit) {
        throw new GameError(
          "INVALID_ACTION",
          `Requested loan inclusive of interest exceeds available credit limit`,
        );
      }
    }

    if (action.type === "CANCEL_RECRUITMENT") {
      const orderExists = sourceNation.recruitmentQueue.some(
        (o) => o.id === action.orderId,
      );
      if (!orderExists) {
        throw new GameError(
          "INVALID_ACTION",
          "Recruitment order not found in the queue",
        );
      }
    }

    if (action.type === "ANTI_CORRUPTION_DRIVE") {
      if (action.amount <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Anti-corruption drive investment must be positive",
        );
      }
      if (sourceNation.treasury < action.amount) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          "Insufficient treasury to fund anti-corruption drive",
        );
      }
    }

    if (action.type === "ATTACK") {
      this.conquestValidator.validateAttack(state, action);
    }
  }
}
