import type { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentTraits {
  militaryPayrollMultiplier: number;
  stabilityDeltaPerTurn: number;
  tradeMultiplier: number;
  militaryPowerMultiplier: number;
}

export class GovernmentSystem {
  public static getTraits(type: GovernmentType): GovernmentTraits {
    switch (type) {
      case "DEMOCRACY":
        return {
          militaryPayrollMultiplier: 1.0,
          stabilityDeltaPerTurn: 1.0,
          tradeMultiplier: 1.25,
          militaryPowerMultiplier: 0.85,
        };
      case "DICTATORSHIP":
        return {
          militaryPayrollMultiplier: 1.0,
          stabilityDeltaPerTurn: -1.0,
          tradeMultiplier: 0.85,
          militaryPowerMultiplier: 1.2,
        };
      case "MONARCHY":
        return {
          militaryPayrollMultiplier: 1.0,
          stabilityDeltaPerTurn: 0.5,
          tradeMultiplier: 1.0,
          militaryPowerMultiplier: 1.0,
        };
      case "COMMUNISM":
        return {
          militaryPayrollMultiplier: 1.0,
          stabilityDeltaPerTurn: 0.0,
          tradeMultiplier: 0.7,
          militaryPowerMultiplier: 1.0,
        };
      case "FASCISM":
        return {
          militaryPayrollMultiplier: 1.0,
          stabilityDeltaPerTurn: -1.5,
          tradeMultiplier: 0.75,
          militaryPowerMultiplier: 1.35,
        };
      default:
        return {
          militaryPayrollMultiplier: 1.0,
          stabilityDeltaPerTurn: 0.0,
          tradeMultiplier: 1.0,
          militaryPowerMultiplier: 1.0,
        };
    }
  }
}
