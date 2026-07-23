import type { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentTraits {
  economicGrowthBonus: number;
  warExhaustionMultiplier: number;
  militaryUpkeepMultiplier: number;
  baseStability: number;
  tradeMultiplier: number;
  militaryPowerMultiplier: number;
}

export class GovernmentSystem {
  public getTraits(type: GovernmentType): GovernmentTraits {
    switch (type) {
      case "DEMOCRACY":
        return {
          economicGrowthBonus: 0.15,
          warExhaustionMultiplier: 1.5,
          militaryUpkeepMultiplier: 1.0,
          baseStability: 70,
          tradeMultiplier: 1.25,
          militaryPowerMultiplier: 0.85,
        };
      case "DICTATORSHIP":
        return {
          economicGrowthBonus: -0.05,
          warExhaustionMultiplier: 0.8,
          militaryUpkeepMultiplier: 0.9,
          baseStability: 50,
          tradeMultiplier: 0.9,
          militaryPowerMultiplier: 1.25,
        };
      case "MONARCHY":
        return {
          economicGrowthBonus: 0.05,
          warExhaustionMultiplier: 0.9,
          militaryUpkeepMultiplier: 1.0,
          baseStability: 80,
          tradeMultiplier: 1.0,
          militaryPowerMultiplier: 1.0,
        };
      case "COMMUNISM":
        return {
          economicGrowthBonus: 0.0,
          warExhaustionMultiplier: 0.7,
          militaryUpkeepMultiplier: 0.75,
          baseStability: 60,
          tradeMultiplier: 0.7,
          militaryPowerMultiplier: 1.0,
        };
      case "FASCISM":
        return {
          economicGrowthBonus: -0.1,
          warExhaustionMultiplier: 0.6,
          militaryUpkeepMultiplier: 1.1,
          baseStability: 55,
          tradeMultiplier: 0.8,
          militaryPowerMultiplier: 1.5,
        };
    }
  }
}
