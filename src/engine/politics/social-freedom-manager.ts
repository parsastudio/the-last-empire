import type { Nation } from "@/domain/nation/nation.schema";

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
}
