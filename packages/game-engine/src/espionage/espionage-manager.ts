import { Nation } from "@/domain/nation/nation.schema";
import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import {
  EspionageTier,
  EspionageExecutionResult,
  EspionageOutcome,
  EspionageReconData,
  EspionageSabotageData,
  EspionageTechTheftData,
} from "@/domain/espionage/espionage.schema";
import {
  GameError,
  TurnLogBuilder,
  SeededRandom,
} from "@/domain/shared/domain-utilities";
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
  ): number {
    return EspionageCalculator.calculateOperationCost(targetGdp, tier);
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
    targetNation?: Nation,
  ): number {
    return EspionageCalculator.calculateSuccessRate(
      tier,
      sourceNation,
      targetNation,
    );
  }

  public static executeOperation(
    state: GameState,
    sourceNationId: string,
    targetNationId: string,
    tier: EspionageTier,
    prng?: SeededRandom,
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
    const executionKey = `${canonicalTarget}:${tier}`;

    if (executedTiers.includes(executionKey)) {
      throw new GameError(
        "INVALID_ACTION",
        `عملیات سطح ${tier} علیه این کشور در این نوبت قبلاً اجرا شده است.`,
      );
    }

    const targetGdp = getNationGdp(target, state.provinces);
    const cost = EspionageCalculator.calculateOperationCost(targetGdp, tier);

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
        "کشور هدف در هیچ‌یک از زمینه‌های نظامی یا صنعتی از شما برتر نیست.",
      );
    }

    const effectivePrng = prng ?? new SeededRandom(state.seed);
    const successRate = EspionageCalculator.calculateSuccessRate(
      tier,
      source,
      target,
    );
    const roll = effectivePrng.nextFloat();
    const isSuccess = roll <= successRate;

    let outcome: EspionageOutcome = "CRITICAL_FAILURE";
    if (isSuccess) {
      const blowbackRoll = effectivePrng.nextFloat();
      outcome = blowbackRoll > 0.3 ? "CLEAN_SUCCESS" : "COMPROMISED_SUCCESS";
    }

    let updatedSource: Nation = {
      ...source,
      treasury: source.treasury - cost,
      executedEspionageTiers: [...executedTiers, executionKey],
    };
    let updatedTarget: Nation = { ...target };
    let updatedProvinces = { ...state.provinces };

    let reconData: EspionageReconData | undefined;
    let sabotageData: EspionageSabotageData | undefined;
    let techTheftData: EspionageTechTheftData | undefined;
    let message = "";

    if (tier === 1) {
      const recon = ReconTierExecutor.execute(target, outcome, state.provinces);
      reconData = recon.reconData;
      message = recon.message;
    } else if (tier === 2) {
      const sabotage = SabotageTierExecutor.execute(
        target,
        isSuccess,
        outcome,
        effectivePrng,
      );
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
        state.provinces,
      );
      updatedSource = heist.updatedSource;
      updatedTarget = heist.updatedTarget;
      updatedProvinces = heist.updatedProvinces;
      techTheftData = heist.techTheftData;
      message = heist.message;
    }

    if (outcome === "COMPROMISED_SUCCESS" || outcome === "CRITICAL_FAILURE") {
      const penalty = tier === 3 ? 10 : tier === 2 ? 7 : 5;
      updatedSource = {
        ...updatedSource,
        globalReputation: Math.max(
          -100,
          updatedSource.globalReputation - penalty,
        ),
      };

      const rel =
        updatedSource.relations[canonicalTarget] ||
        updatedSource.relations[target.id];
      if (rel) {
        const key = rel.targetNationId || canonicalTarget;
        updatedSource.relations = {
          ...updatedSource.relations,
          [key]: {
            ...rel,
            alignment: Math.max(-100, (rel.alignment ?? 0) - tier * 15),
            tension: Math.min(100, (rel.tension ?? 10) + tier * 10),
          },
        };
      }

      const targetRel =
        updatedTarget.relations[canonicalSource] ||
        updatedTarget.relations[source.id];
      if (targetRel) {
        const key = targetRel.targetNationId || canonicalSource;
        updatedTarget.relations = {
          ...updatedTarget.relations,
          [key]: {
            ...targetRel,
            alignment: Math.max(-100, (targetRel.alignment ?? 0) - tier * 25),
            tension: Math.min(100, (targetRel.tension ?? 10) + tier * 20),
          },
        };
      }
    }

    const newLogs: TurnLogEntry[] = [];

    const attackerLog = TurnLogBuilder.createNationalLog(
      state.currentTurn,
      source.id,
      "ESPIONAGE",
      outcome === "CRITICAL_FAILURE" ? "WARNING" : "INFO",
      "ESPIONAGE_OPERATION",
      { details: message, tier, outcome, role: "ATTACKER" },
      target.id,
    );
    newLogs.push(attackerLog);

    if (outcome === "CLEAN_SUCCESS") {
      if (tier === 2) {
        const defenderLog = TurnLogBuilder.createNationalLog(
          state.currentTurn,
          target.id,
          "ESPIONAGE",
          "CRITICAL",
          "ESPIONAGE_OPERATION",
          {
            details:
              "هشدار امنیتی: انفجارهای زنجیره‌ای مشکوک در پایگاه‌های تسلیحاتی کشور رخ داد و بخشی از ادوات منهدم گردید (عاملان ناشناس بدون رد متواری شدند).",
            tier,
            outcome,
            role: "DEFENDER",
          },
        );
        newLogs.push(defenderLog);
      }
    } else if (outcome === "COMPROMISED_SUCCESS") {
      let defenderMsg = "";
      if (tier === 1) {
        defenderMsg = `گزارش ضدجاسوسی: تلاش برای شنود سیگنالی و نفوذ به مراکز فرماندهی کشف شد و فرکانس‌های ارسالی از کشور ${source.name} رصد گردید.`;
      } else if (tier === 2) {
        defenderMsg = `هشدار تروریستی: خرابکاری در پایگاه‌های تسلیحاتی رخ داد، اما تیم نفوذی لو رفت و مشخص شد عملیات با هدایت کشور ${source.name} بوده است.`;
      } else {
        defenderMsg = `رخنه امنیتی: سرورهای تحقیقاتی هدف نفوذ سایبری قرار گرفتند. سازمان ضدجاسوسی منشأ حمله را در کشور ${source.name} شناسایی کرد.`;
      }

      const defenderLog = TurnLogBuilder.createNationalLog(
        state.currentTurn,
        target.id,
        "ESPIONAGE",
        "CRITICAL",
        "ESPIONAGE_OPERATION",
        {
          details: defenderMsg,
          tier,
          outcome,
          role: "DEFENDER",
        },
        source.id,
      );
      newLogs.push(defenderLog);
    } else if (outcome === "CRITICAL_FAILURE") {
      let defenderMsg = "";
      if (tier === 1) {
        defenderMsg = `موفقیت ضدجاسوسی: شبکه شنود و سیگنال‌های نفوذی ارسال‌شده از کشور ${source.name} پیش از نفوذ خنثی و مسدود گردید.`;
      } else if (tier === 2) {
        defenderMsg = `پیروزی امنیتی: تیم خرابکاری اعزامی از کشور ${source.name} پیش از هرگونه اقدام در پایگاه‌های نظامی شناسایی و دستگیر شد.`;
      } else {
        defenderMsg = `دفاع سایبری: نفوذ هکرهای وابسته به کشور ${source.name} به سرورهای محرمانه دفع شد و کلیه کدهای نفوذی مسدود گردیدند.`;
      }

      const defenderLog = TurnLogBuilder.createNationalLog(
        state.currentTurn,
        target.id,
        "ESPIONAGE",
        "INFO",
        "ESPIONAGE_OPERATION",
        {
          details: defenderMsg,
          tier,
          outcome,
          role: "DEFENDER",
        },
        source.id,
      );
      newLogs.push(defenderLog);
    }

    const updatedNations = {
      ...state.nations,
      [source.id]: updatedSource,
      [target.id]: updatedTarget,
    };

    const newState: GameState = {
      ...state,
      seed: effectivePrng.getSeed(),
      provinces: updatedProvinces,
      nations: updatedNations,
      turnLogs: [...state.turnLogs, ...newLogs],
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
