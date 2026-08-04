import type { DoctrinesState } from "@/domain/politics/doctrines.schema";
import {
  COMPREHENSIVE_RESEARCH_TREE,
  ResearchNode,
} from "@/domain/politics/research-tree.config";

export type { ResearchNode as Doctrine };

export class DoctrinesManager {
  private static readonly doctrines: ResearchNode[] =
    COMPREHENSIVE_RESEARCH_TREE;

  public static getAvailableDoctrines(): ResearchNode[] {
    return [...DoctrinesManager.doctrines];
  }

  public static purchaseDoctrine(
    state: DoctrinesState,
    doctrineId: string,
  ): DoctrinesState {
    const doctrine = DoctrinesManager.doctrines.find(
      (d) => d.id === doctrineId,
    );
    if (!doctrine) {
      throw new Error("DOCTRINE_NOT_FOUND");
    }
    if ((state.unlockedDoctrines || []).includes(doctrineId)) {
      throw new Error("ALREADY_UNLOCKED");
    }
    if (state.doctrinePoints < doctrine.cost) {
      throw new Error("INSUFFICIENT_DOCTRINE_POINTS");
    }

    const missingPrereqs = doctrine.prerequisites.filter(
      (req) => !(state.unlockedDoctrines || []).includes(req),
    );
    if (missingPrereqs.length > 0) {
      throw new Error("PREREQUISITES_NOT_MET");
    }

    return {
      doctrinePoints: state.doctrinePoints - doctrine.cost,
      unlockedDoctrines: [...(state.unlockedDoctrines || []), doctrineId],
    };
  }

  public static getGdpTaxRevenueMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("gdp-booster")) bonus += 0.05;
    if (unlocked.includes("cybernetic-automation")) bonus += 0.15;
    return 1.0 + bonus;
  }

  public static getReputationGainMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("trade-diplomacy") ? 1.25 : 1.0;
  }

  public static getOilDemandDiscount(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("low-upkeep") ? 0.85 : 1.0;
  }

  public static getMilitaryPayrollMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("cybernetic-automation") ? 0.8 : 1.0;
  }

  public static getSteelProductionBonus(unlocked?: string[]): number {
    if (!unlocked) return 0;
    return unlocked.includes("heavy-metallurgy") ? 2 : 0;
  }

  public static getOilProductionBonus(unlocked?: string[]): number {
    if (!unlocked) return 0;
    return unlocked.includes("deep-refining") ? 3 : 0;
  }

  public static getMilitiaPowerMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("border-fortification") ? 1.25 : 1.0;
  }

  public static getDronePowerMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("tactical-drones")) bonus += 0.2;
    if (unlocked.includes("precision-missiles")) bonus += 0.25;
    return 1.0 + bonus;
  }

  public static getAirDefenseInterceptionRate(unlocked?: string[]): number {
    if (!unlocked) return 0;
    return unlocked.includes("integrated-air-defense") ? 0.3 : 0;
  }

  public static getPrecisionMissileDirectDamage(unlocked?: string[]): number {
    if (!unlocked) return 0;
    return unlocked.includes("precision-missiles") ? 0.3 : 0;
  }

  public static getElectronicWarfareEvasion(unlocked?: string[]): boolean {
    if (!unlocked) return false;
    return unlocked.includes("electronic-warfare");
  }

  public static getTariffRevenueMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("global-influence") ? 1.15 : 1.0;
  }

  public static getProxyCostDiscount(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("proxy-network") ? 0.75 : 1.0;
  }

  public static getTaxStabilityPenaltyDiscount(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("reputation-recovery") ? 0.5 : 1.0;
  }

  public static getDiplomaticOpinionThresholdBonus(
    unlocked?: string[],
  ): number {
    if (!unlocked) return 0;
    return unlocked.includes("security-alliance") ? 30 : 0;
  }
}
