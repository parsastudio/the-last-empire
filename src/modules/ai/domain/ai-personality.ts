import type {
  AIPersonalityType,
  AIPersonalityWeights,
} from "@/modules/ai/schemas/ai.schema";

export class AIPersonality {
  public getPersonalityWeights(type: AIPersonalityType): AIPersonalityWeights {
    switch (type) {
      case "AGGRESSIVE":
        return {
          personality: "AGGRESSIVE",
          aggressionMultiplier: 1.5,
          defenseMultiplier: 0.8,
          economicFocus: 0.6,
          diplomaticFocus: 0.4,
        };
      case "PACIFIST":
        return {
          personality: "PACIFIST",
          aggressionMultiplier: 0.3,
          defenseMultiplier: 1.2,
          economicFocus: 1.0,
          diplomaticFocus: 1.5,
        };
      case "ECONOMIC":
        return {
          personality: "ECONOMIC",
          aggressionMultiplier: 0.6,
          defenseMultiplier: 0.9,
          economicFocus: 1.6,
          diplomaticFocus: 0.8,
        };
      case "ISOLATIONIST":
        return {
          personality: "ISOLATIONIST",
          aggressionMultiplier: 0.5,
          defenseMultiplier: 1.4,
          economicFocus: 0.8,
          diplomaticFocus: 0.2,
        };
    }
  }
}
