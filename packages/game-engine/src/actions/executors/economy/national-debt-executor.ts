import { GameState } from "@/domain/game/game-state.schema";
import {
  RequestLoanAction,
  RepayDebtAction,
} from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { DebtCalculatorUtility } from "@geopolitics/domain";

export class NationalDebtExecutor {
  public static handleRequestLoan(
    state: GameState,
    action: RequestLoanAction,
    nation: Nation,
    buyerKey: string,
  ): GameState {
    if (action.amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "مبلغ وام باید بزرگتر از صفر باشد.",
      );
    }
    const maxManualDebtLimit = DebtCalculatorUtility.getMaxDebtLimit(
      getNationGdp(nation, state.provinces),
    );
    if (nation.nationalDebt + action.amount > maxManualDebtLimit) {
      throw new GameError(
        "INVALID_ACTION",
        "سقف مجاز وام دستی (۳۰٪ تولید ناخالص داخلی) تکمیل شده است.",
      );
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury + action.amount,
          nationalDebt: nation.nationalDebt + action.amount,
        },
      },
    };
  }

  public static handleRepayDebt(
    state: GameState,
    action: RepayDebtAction,
    nation: Nation,
    buyerKey: string,
  ): GameState {
    if (action.amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "مبلغ تسویه باید بزرگتر از صفر باشد.",
      );
    }
    if (nation.nationalDebt <= 0) {
      throw new GameError("INVALID_ACTION", "هیچ بدهی معوقی وجود ندارد.");
    }
    if (nation.treasury < action.amount) {
      throw new GameError("INSUFFICIENT_FUNDS", "موجودی خزانه کافی نیست.");
    }
    const repayAmount = Math.min(action.amount, nation.nationalDebt);
    return {
      ...state,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - repayAmount,
          nationalDebt: nation.nationalDebt - repayAmount,
        },
      },
    };
  }
}
