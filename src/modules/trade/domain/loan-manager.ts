import type { Nation } from "@/core/types/nation.types";
import { GameError } from "@/core/errors/game-error";

export interface InterNationLoan {
  id: string;
  lenderId: string;
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  turnsRemaining: number;
}

export class LoanManager {
  public issueLoan(
    lender: Nation,
    borrower: Nation,
    amount: number,
    interestRate = 0.08,
    durationTurns = 10,
  ): { lender: Nation; borrower: Nation; loan: InterNationLoan } {
    if (lender.treasury < amount) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Lender does not have enough treasury to issue loan",
      );
    }

    const loan: InterNationLoan = {
      id: `loan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lenderId: lender.id,
      borrowerId: borrower.id,
      principalAmount: amount,
      interestRate,
      turnsRemaining: durationTurns,
    };

    const updatedLender: Nation = {
      ...lender,
      treasury: lender.treasury - amount,
    };

    const updatedBorrower: Nation = {
      ...borrower,
      treasury: borrower.treasury + amount,
    };

    return { lender: updatedLender, borrower: updatedBorrower, loan };
  }

  public processTurnLoanRepayment(
    borrower: Nation,
    lender: Nation,
    loan: InterNationLoan,
  ): {
    borrower: Nation;
    lender: Nation;
    loanDefaulted: boolean;
    remainingLoan?: InterNationLoan;
  } {
    const interest = Math.floor(loan.principalAmount * loan.interestRate);
    const principalInstallment = Math.floor(
      loan.principalAmount / loan.turnsRemaining,
    );
    const totalDue = interest + principalInstallment;

    if (borrower.treasury < totalDue) {
      const relation = lender.relations[borrower.id];
      const updatedLenderRelation = relation
        ? { ...relation, opinion: Math.max(-100, relation.opinion - 30) }
        : undefined;

      const updatedLender = updatedLenderRelation
        ? {
            ...lender,
            relations: {
              ...lender.relations,
              [borrower.id]: updatedLenderRelation,
            },
          }
        : lender;

      return {
        borrower,
        lender: updatedLender,
        loanDefaulted: true,
      };
    }

    const updatedBorrower: Nation = {
      ...borrower,
      treasury: borrower.treasury - totalDue,
    };

    const updatedLender: Nation = {
      ...lender,
      treasury: lender.treasury + totalDue,
    };

    const remainingTurns = loan.turnsRemaining - 1;
    if (remainingTurns <= 0) {
      return {
        borrower: updatedBorrower,
        lender: updatedLender,
        loanDefaulted: false,
      };
    }

    return {
      borrower: updatedBorrower,
      lender: updatedLender,
      loanDefaulted: false,
      remainingLoan: {
        ...loan,
        principalAmount: loan.principalAmount - principalInstallment,
        turnsRemaining: remainingTurns,
      },
    };
  }
}
