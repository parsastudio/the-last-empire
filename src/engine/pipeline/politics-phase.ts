import type { GameState } from "@/domain/game/game-state.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { CorruptionManager } from "@/engine/politics/corruption-manager";
import { ElectionEngine } from "@/engine/politics/election-engine";
import { TraitManager } from "@/engine/politics/trait-manager";
import { DomesticCrisisManager } from "@/engine/politics/domestic-crisis-manager";
import { ProxyWarManager } from "@/engine/politics/proxy-war-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export interface PoliticsEngines {
  stabilityCalc: StabilityCalculator;
  corruptionManager: CorruptionManager;
  domesticCrisisManager: DomesticCrisisManager;
  electionEngine: ElectionEngine;
  traitManager: TraitManager;
}

export class PoliticsPhase implements TurnPhase {
  private engines: PoliticsEngines;
  private proxyManager = new ProxyWarManager();

  constructor(engines?: PoliticsEngines) {
    this.engines = engines ?? {
      stabilityCalc: new StabilityCalculator(),
      corruptionManager: new CorruptionManager(),
      domesticCrisisManager: new DomesticCrisisManager(),
      electionEngine: new ElectionEngine(),
      traitManager: new TraitManager(),
    };
  }

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = {
        ...nation,
        government: {
          ...nation.government,
        },
      };

      let accumulatedProxyBudget = 0;
      for (const other of Object.values(nations)) {
        if (other.isAlive && other.id !== id) {
          accumulatedProxyBudget += other.proxyInfluenceBudget[id] || 0;
        }
      }

      const proxyResult = this.proxyManager.processTurnProxyImpact(
        updated,
        accumulatedProxyBudget,
      );
      updated = proxyResult.updatedTargetNation;

      if (proxyResult.coupTriggered) {
        for (const otherId of Object.keys(nations)) {
          if (nations[otherId]?.proxyInfluenceBudget) {
            nations[otherId].proxyInfluenceBudget[id] = 0;
          }
        }
      }

      updated.government.corruption =
        this.engines.corruptionManager.updateCorruptionLevel(updated);

      let stability =
        this.engines.stabilityCalc.calculateTurnStability(updated);
      stability = Math.max(
        0,
        Math.min(
          100,
          stability + this.engines.traitManager.getBaseStabilityDelta(updated),
        ),
      );
      updated.government.stability = stability;

      const pointsEarned = 0.1 + (stability / 100) * 0.1;
      updated.doctrines.doctrinePoints = Number(
        (updated.doctrines.doctrinePoints + pointsEarned).toFixed(2),
      );

      const electionResult = this.engines.electionEngine.processElection(
        updated,
        nextState.currentTurn,
        context.prng.nextInt(1, 1000000),
      );
      if (electionResult.electionHeld) {
        updated = electionResult.updatedNation;
      }

      const crisisResult =
        this.engines.domesticCrisisManager.checkAndProcessCrisis(updated);
      updated = crisisResult.updatedNation;

      if (crisisResult.status === "COUP") {
        for (const otherId of Object.keys(nations)) {
          if (nations[otherId]?.proxyInfluenceBudget) {
            nations[otherId].proxyInfluenceBudget[id] = 0;
          }
        }
      }

      updated.government = {
        ...updated.government,
        turnsInPower: updated.government.turnsInPower + 1,
      };

      const updatedBudgets = { ...updated.proxyInfluenceBudget };
      for (const targetId of Object.keys(updatedBudgets)) {
        updatedBudgets[targetId] = Math.max(
          0,
          Math.floor(updatedBudgets[targetId] * 0.75),
        );
      }
      updated.proxyInfluenceBudget = updatedBudgets;

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
