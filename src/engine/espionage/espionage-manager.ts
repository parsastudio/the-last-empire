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
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";
import { InfrastructureManager } from "@/engine/economy/calculators/infrastructure-manager";

export interface TechSuperiorityDelta {
  militaryDelta: number;
  industrialDelta: number;
  infrastructureDelta: number;
  totalAvailablePoints: number;
}

export class EspionageManager {
  public static readonly TIER_1_COST_RATIO = 0.06;
  public static readonly TIER_2_COST_RATIO = 0.18;
  public static readonly TIER_3_COST_RATIO = 0.4;

  public static calculateOperationCost(
    targetGdp: number,
    tier: EspionageTier,
    sourceNation: Nation,
  ): number {
    let baseRatio = this.TIER_1_COST_RATIO;
    if (tier === 2) baseRatio = this.TIER_2_COST_RATIO;
    if (tier === 3) baseRatio = this.TIER_3_COST_RATIO;

    const baseCost = Math.floor(targetGdp * baseRatio);
    const industrialDiscount = Math.max(
      0.7,
      1.0 - (sourceNation.industrialLevel - 1) * 0.05,
    );
    const doctrineDiscount = DoctrinesManager.getProxyCostDiscount(
      sourceNation.doctrines?.unlockedDoctrines,
    );

    return Math.max(
      1000000000,
      Math.floor(baseCost * industrialDiscount * doctrineDiscount),
    );
  }

  public static calculateTechSuperiority(
    sourceNation: Nation,
    targetNation: Nation,
  ): TechSuperiorityDelta {
    const militaryDelta = Math.max(
      0,
      targetNation.military.techLevel - sourceNation.military.techLevel,
    );
    const industrialDelta = Math.max(
      0,
      targetNation.industrialLevel - sourceNation.industrialLevel,
    );
    const infrastructureDelta = Math.max(
      0,
      targetNation.geography.infrastructureLevel -
        sourceNation.geography.infrastructureLevel,
    );

    return {
      militaryDelta,
      industrialDelta,
      infrastructureDelta,
      totalAvailablePoints:
        militaryDelta + industrialDelta + infrastructureDelta,
    };
  }

  public static calculateSuccessRate(
    tier: EspionageTier,
    sourceNation: Nation,
  ): number {
    let baseChance = 0.8;
    if (tier === 2) baseChance = 0.6;
    if (tier === 3) baseChance = 0.4;

    const indBonus = (sourceNation.industrialLevel - 1) * 0.03;
    return Math.min(0.95, baseChance + indBonus);
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
      state.nations[sourceNationId] || state.nations[canonicalSource];
    const target =
      state.nations[targetNationId] || state.nations[canonicalTarget];

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
    const cost = this.calculateOperationCost(targetGdp, tier, source);

    if (source.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای تأمین بودجه این عملیات سیاه کافی نیست.",
      );
    }

    const superiority = this.calculateTechSuperiority(source, target);
    if (tier === 3 && superiority.totalAvailablePoints <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "کشور هدف در هیچ‌یک از زمینه‌های نظامی، صنعتی یا زیرساختی از شما برتر نیست.",
      );
    }

    const successRate = this.calculateSuccessRate(tier, source);
    const roll = Math.random();
    const isSuccess = roll <= successRate;

    let outcome: EspionageOutcome = "CRITICAL_FAILURE";
    if (isSuccess) {
      const blowbackRoll = Math.random();
      outcome = blowbackRoll > 0.3 ? "CLEAN_SUCCESS" : "COMPROMISED_SUCCESS";
    }

    let updatedSource = {
      ...source,
      treasury: source.treasury - cost,
      executedEspionageTiers: [...executedTiers, tier],
    };
    let updatedTarget = { ...target };

    let reconData: EspionageReconData | undefined;
    let sabotageData: EspionageSabotageData | undefined;
    let techTheftData: EspionageTechTheftData | undefined;
    let message = "";

    if (tier === 1) {
      reconData = {
        infantry: target.military.infantry,
        armor: target.military.armor || 0,
        airDefense: target.military.airDefense || 0,
        airForce: target.military.airForce,
        droneMissile: target.military.droneMissile,
        navalFleet: target.military.navalFleet || 0,
        techLevel: target.military.techLevel,
        industrialLevel: target.industrialLevel,
        infrastructureLevel: target.geography.infrastructureLevel,
        treasury: target.treasury,
        gdp: targetGdp,
        stability: target.government.stability,
        activeProvincesCount: target.provinceIds?.length || 1,
      };

      if (outcome === "CLEAN_SUCCESS") {
        message = `شنود ماهواره‌ای کامل با موفقیت انجام شد. تمام مختصات نظامی و خزانه‌داری ${target.name} بدون هیچ ردیابی آشکار گردید.`;
      } else if (outcome === "COMPROMISED_SUCCESS") {
        message = `شنود ماهواره‌ای موفق بود اما فرکانس نفوذ رصد شد (-۱۵ دیدگاه با ${target.name}).`;
      } else {
        message = `شبکه ضدجاسوسی ${target.name} سیگنال‌های شنود را مختل کرد و عملیات شناسایی ناکام ماند.`;
      }
    } else if (tier === 2) {
      if (isSuccess) {
        const destRatio = 0.2 + Math.random() * 0.1;
        const infLost = Math.floor((target.military.infantry || 0) * destRatio);
        const armLost = Math.floor((target.military.armor || 0) * destRatio);
        const adLost = Math.floor(
          (target.military.airDefense || 0) * destRatio,
        );
        const afLost = Math.floor((target.military.airForce || 0) * destRatio);
        const drLost = Math.floor(
          (target.military.droneMissile || 0) * destRatio,
        );
        const nvLost = Math.floor(
          (target.military.navalFleet || 0) * destRatio,
        );

        const updatedTargetMil = MilitaryInventoryHelper.applyCasualties(
          target.military,
          infLost,
          armLost,
          adLost,
          afLost,
          drLost,
          nvLost,
        );

        const stabDrain = 4;
        updatedTarget = {
          ...updatedTarget,
          military: updatedTargetMil,
          government: {
            ...updatedTarget.government,
            stability: Math.max(
              0,
              updatedTarget.government.stability - stabDrain,
            ),
          },
        };

        sabotageData = {
          infantryDestroyed: infLost,
          armorDestroyed: armLost,
          airDefenseDestroyed: adLost,
          airForceDestroyed: afLost,
          droneMissileDestroyed: drLost,
          navalFleetDestroyed: nvLost,
          stabilityDrain: stabDrain,
        };

        if (outcome === "CLEAN_SUCCESS") {
          message = `عملیات خرابکاری در پایگاه‌های ${target.name} با انهدام موفق ادوات و پدافند به پایان رسید. هیچ ردی به جا نماند.`;
        } else {
          message = `خرابکاری موفق بود و انبارهای تسلیحات ${target.name} منفجر شد، اما تیم نفوذی لو رفت (-۳۰ دیدگاه، -۵ اعتبار جهانی).`;
        }
      } else {
        message = `تیم خرابکاری توسط گشت‌های ضدجاسوسی ${target.name} رهگیری و منهدم شد (-۳۵ دیدگاه، -۱۰ اعتبار جهانی).`;
      }
    } else if (tier === 3) {
      if (isSuccess) {
        const pointsToGrant = Math.min(3, superiority.totalAvailablePoints);
        let remainingPoints = pointsToGrant;

        let gMil = 0;
        let gInd = 0;
        let gInfra = 0;

        let currMilGap = superiority.militaryDelta;
        let currIndGap = superiority.industrialDelta;
        let currInfraGap = superiority.infrastructureDelta;

        while (remainingPoints > 0) {
          if (currMilGap > 0) {
            gMil++;
            currMilGap--;
            remainingPoints--;
            if (remainingPoints <= 0) break;
          }
          if (currIndGap > 0) {
            gInd++;
            currIndGap--;
            remainingPoints--;
            if (remainingPoints <= 0) break;
          }
          if (currInfraGap > 0) {
            gInfra++;
            currInfraGap--;
            remainingPoints--;
            if (remainingPoints <= 0) break;
          }
          if (currMilGap === 0 && currIndGap === 0 && currInfraGap === 0) {
            break;
          }
        }

        const newTechLevel = updatedSource.military.techLevel + gMil;
        const newIndLevel = updatedSource.industrialLevel + gInd;
        const newInfraLevel =
          updatedSource.geography.infrastructureLevel + gInfra;

        let nextCapacity = updatedSource.maxPopulationCapacity;
        for (let i = 0; i < gInfra; i++) {
          nextCapacity =
            InfrastructureManager.calculateNextCapacityOnUpgrade(nextCapacity);
        }

        let nextProductivity = updatedSource.perCapitaProductivity;
        for (let i = 0; i < gInd; i++) {
          nextProductivity =
            GdpCalculator.calculateProductivityOnUpgrade(nextProductivity);
        }

        updatedSource = GdpCalculator.syncNationGdpAndDemographics(
          {
            ...updatedSource,
            industrialLevel: newIndLevel,
            maxPopulationCapacity: nextCapacity,
            military: {
              ...updatedSource.military,
              techLevel: newTechLevel,
            },
            geography: {
              ...updatedSource.geography,
              infrastructureLevel: newInfraLevel,
            },
          },
          updatedSource.population,
          nextProductivity,
        );

        const stabDrain = 6;
        updatedTarget = {
          ...updatedTarget,
          government: {
            ...updatedTarget.government,
            stability: Math.max(
              0,
              updatedTarget.government.stability - stabDrain,
            ),
          },
        };

        techTheftData = {
          militaryTechGained: gMil,
          industrialLevelGained: gInd,
          infrastructureLevelGained: gInfra,
          totalPointsGained: pointsToGrant,
          stabilityDrain: stabDrain,
        };

        if (outcome === "CLEAN_SUCCESS") {
          message = `سرقت قرن با موفقیت انجام شد! دانشمندان شما موفق شدند ${pointsToGrant} امتیاز ارتقای فناوری از ${target.name} استخراج و اعمال کنند.`;
        } else {
          message = `سرقت فناوری (${pointsToGrant} امتیاز ارتقا) موفق بود اما وزارت اطلاعات ${target.name} عاملان را شناسایی کرد (-۵۰ دیدگاه، -۱۵ اعتبار جهانی).`;
        }
      } else {
        message = `نفوذ به سرورهای محرمانه ${target.name} شکست خورد و کدهای نفوذی مسدود شدند (-۴۰ دیدگاه، -۱۵ اعتبار جهانی).`;
      }
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
    }

    const logEntry = TurnLogBuilder.createLogEntry(
      state.currentTurn,
      source.id,
      outcome === "CRITICAL_FAILURE" ? "WARNING" : "INFO",
      `عملیات ویژه اطلاعاتی علیه ${target.name}: ${message}`,
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
