import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import {
  EspionageTier,
  EspionageExecutionResult,
  EspionageOutcome,
  EspionageReconData,
  EspionageSabotageData,
  EspionageTechTheftData,
} from "@/domain/espionage/espionage.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import {
  EspionageCalculator,
  TechSuperiorityDelta,
} from "@/engine/espionage/espionage-calculator";
import { ReconTierExecutor } from "@/engine/espionage/executors/recon-tier-executor";
import { SabotageTierExecutor } from "@/engine/espionage/executors/sabotage-tier-executor";
import { TechHeistExecutor } from "@/engine/espionage/executors/tech-heist-executor";

export type { TechSuperiorityDelta };

export class EspionageManager {
  public static calculateOperationCost(
    targetGdp: number,
    tier: EspionageTier,
    sourceNation: Nation,
  ): number {
    return EspionageCalculator.calculateOperationCost(
      targetGdp,
      tier,
      sourceNation,
    );
  }

  public static calculateTechSuperiority(
    sourceNation: Nation,
    targetNation: Nation,
  ): TechSuperiorityDelta {
    return EspionageCalculator.calculateTechSuperiority(
      sourceNation,
      targetNation,
    );
  }

  public static calculateSuccessRate(
    tier: EspionageTier,
    sourceNation: Nation,
  ): number {
    return EspionageCalculator.calculateSuccessRate(tier, sourceNation);
  }

  public static executeOperation(
    state: GameState,
    sourceNationId: string,
    targetNationId: string,
    tier: EspionageTier,
  ): { newState: GameState; result: EspionageExecutionResult } {
    const canonicalSource = CountryRegistry.resolveCanonicalId(sourceNationId);
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNationId);

    const source =
      state.nations[canonicalSource] || state.nations[sourceNationId];
    const target =
      state.nations[canonicalTarget] || state.nations[targetNationId];

    if (!source || !source.isAlive) {
      throw new GameError(
        "NATION_NOT_FOUND",
        "کشور صادرکننده دستور فعال نیست.",
      );
    }
    if (!target || !target.isAlive) {
      throw new GameError("NATION_NOT_FOUND", "کشور هدف فعال نیست.");
    }

    const executedTiers = source.executedEspionageTiers || [];
    if (executedTiers.includes(tier)) {
      throw new GameError(
        "INVALID_ACTION",
        `عملیات سطح ${tier} در این نوبت قبلاً اجرا شده است. هر سطح فقط ۱ بار در هر نوبت مجاز است.`,
      );
    }

    const targetGdp = getNationGdp(target);
    const cost = EspionageCalculator.calculateOperationCost(
      targetGdp,
      tier,
      source,
    );

    if (source.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای تأمین بودجه این عملیات سیاه کافی نیست.",
      );
    }

    const superiority = EspionageCalculator.calculateTechSuperiority(
      source,
      target,
    );
    if (tier === 3 && superiority.totalAvailablePoints <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "کشور هدف در هیچ‌یک از زمینه‌های نظامی، صنعتی یا زیرساختی از شما برتر نیست.",
      );
    }

    const successRate = EspionageCalculator.calculateSuccessRate(tier, source);
    const roll = Math.random();
    const isSuccess = roll <= successRate;

    let outcome: EspionageOutcome = "CRITICAL_FAILURE";
    if (isSuccess) {
      const blowbackRoll = Math.random();
      outcome = blowbackRoll > 0.3 ? "CLEAN_SUCCESS" : "COMPROMISED_SUCCESS";
    }

    let updatedSource: Nation = {
      ...source,
      treasury: source.treasury - cost,
      executedEspionageTiers: [...executedTiers, tier],
    };
    let updatedTarget: Nation = { ...target };

    let reconData: EspionageReconData | undefined;
    let sabotageData: EspionageSabotageData | undefined;
    let techTheftData: EspionageTechTheftData | undefined;
    let message = "";

    if (tier === 1) {
      const recon = ReconTierExecutor.execute(target, outcome);
      reconData = recon.reconData;
      message = recon.message;
    } else if (tier === 2) {
      const sabotage = SabotageTierExecutor.execute(target, isSuccess, outcome);
      updatedTarget = sabotage.updatedTarget;
      sabotageData = sabotage.sabotageData;
      message = sabotage.message;
    } else if (tier === 3) {
      const heist = TechHeistExecutor.execute(
        updatedSource,
        updatedTarget,
        superiority,
        isSuccess,
        outcome,
      );
      updatedSource = heist.updatedSource;
      updatedTarget = heist.updatedTarget;
      techTheftData = heist.techTheftData;
      message = heist.message;
    }

    if (outcome === "COMPROMISED_SUCCESS") {
      const penalty = tier === 3 ? 15 : tier === 2 ? 5 : 2;
      updatedSource = {
        ...updatedSource,
        globalReputation: Math.max(
          -100,
          updatedSource.globalReputation - penalty,
        ),
      };

      const rel = updatedSource.relations[target.id];
      if (rel) {
        updatedSource.relations = {
          ...updatedSource.relations,
          [target.id]: {
            ...rel,
            opinion: Math.max(-100, rel.opinion - tier * 15),
          },
        };
      }

      const targetRel = updatedTarget.relations[source.id];
      if (targetRel) {
        const currentTargetGrudge = targetRel.grudge ?? 0;
        updatedTarget.relations = {
          ...updatedTarget.relations,
          [source.id]: {
            ...targetRel,
            opinion: Math.max(-100, targetRel.opinion - tier * 20),
            grudge: Math.min(100, currentTargetGrudge + tier * 15),
          },
        };
      }
    } else if (outcome === "CRITICAL_FAILURE") {
      const penalty = tier === 3 ? 20 : tier === 2 ? 10 : 5;
      updatedSource = {
        ...updatedSource,
        globalReputation: Math.max(
          -100,
          updatedSource.globalReputation - penalty,
        ),
      };

      const rel = updatedSource.relations[target.id];
      if (rel) {
        updatedSource.relations = {
          ...updatedSource.relations,
          [target.id]: {
            ...rel,
            opinion: Math.max(-100, rel.opinion - tier * 20),
          },
        };
      }

      const targetRel = updatedTarget.relations[source.id];
      if (targetRel) {
        const currentTargetGrudge = targetRel.grudge ?? 0;
        updatedTarget.relations = {
          ...updatedTarget.relations,
          [source.id]: {
            ...targetRel,
            opinion: Math.max(-100, targetRel.opinion - tier * 25),
            grudge: Math.min(100, currentTargetGrudge + tier * 20),
          },
        };
      }
    }

    const logEntry = TurnLogBuilder.createNationalLog(
      state.currentTurn,
      source.id,
      "ESPIONAGE",
      outcome === "CRITICAL_FAILURE" ? "WARNING" : "INFO",
      `عملیات ویژه اطلاعاتی علیه ${target.name}: ${message}`,
      target.id,
    );

    const updatedNations = {
      ...state.nations,
      [source.id]: updatedSource,
      [target.id]: updatedTarget,
    };

    const newState: GameState = {
      ...state,
      nations: updatedNations,
      turnLogs: [...state.turnLogs, logEntry],
    };

    const result: EspionageExecutionResult = {
      id: `esp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tier,
      operationType:
        tier === 1 ? "RECON" : tier === 2 ? "SABOTAGE" : "TECH_THEFT",
      targetNationId: target.id,
      targetName: target.name,
      outcome,
      message,
      cost,
      reconData,
      sabotageData,
      techTheftData,
      timestamp: Date.now(),
    };

    return { newState, result };
  }
}
