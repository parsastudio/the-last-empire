import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class SocialFreedomManager {
  public calculateSocialFreedomIndex(nation: Nation): number {
    switch (nation.government.type) {
      case "DEMOCRACY":
        return Math.min(100, Math.floor(80 + (100 - nation.taxRate) * 0.2));
      case "MONARCHY":
        return 50;
      case "COMMUNISM":
        return 30;
      case "DICTATORSHIP":
        return 20;
      case "FASCISM":
        return 10;
    }
  }

  public calculateBrainDrainEffect(
    socialFreedom: number,
    population: number,
  ): number {
    if (socialFreedom >= 40) {
      return 0;
    }

    const drainRate = (40 - socialFreedom) * 0.0002;
    return Math.floor(population * drainRate);
  }
}
