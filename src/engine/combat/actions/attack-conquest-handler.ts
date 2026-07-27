import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { ActionHandler } from "@/engine/actions/action-handler";
import { GridState } from "@/engine/combat/state/grid-state";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";
import { GdpPopUpdater } from "@/engine/combat/state/gdp-pop-updater";
import { ConquestLogWriter } from "@/engine/combat/orchestrator/conquest-log-writer";
import { ClosestBaseFinder } from "@/engine/combat/routing/closest-base-finder";
import { NavalPathResolver } from "@/engine/combat/routing/naval-path-resolver";
import { GameError } from "@/domain/shared/game-error";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class AttackConquestHandler implements ActionHandler {
  private orchestrator = new ConquestOrchestrator();
  private gdpPopUpdater = new GdpPopUpdater();
  private logWriter = new ConquestLogWriter();
  private baseFinder = new ClosestBaseFinder();
  private pathResolver = new NavalPathResolver();

  private getClosestCoastalPixel(
    targetNationId: string,
    clickedPixel: { x: number; y: number },
    allCells: GridCell[],
  ): { x: number; y: number } {
    const defenderCells = allCells.filter((c) => c.ownerId === targetNationId);
    if (defenderCells.length === 0) {
      return clickedPixel;
    }

    const coastalCells: GridCell[] = [];
    const cellMap = new Map<string, GridCell>();
    allCells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    for (const cell of defenderCells) {
      const neighbors = [
        { x: cell.x + 1, y: cell.y },
        { x: cell.x - 1, y: cell.y },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x, y: cell.y - 1 },
      ];
      let isCoastal = false;
      for (const n of neighbors) {
        const nCell = cellMap.get(`${n.x},${n.y}`);
        if (
          nCell &&
          (nCell.ownerId === "WATER" || nCell.ownerId === "CLOSED_SEA")
        ) {
          isCoastal = true;
          break;
        }
      }
      if (isCoastal) {
        coastalCells.push(cell);
      }
    }

    if (coastalCells.length === 0) {
      let closestCell = defenderCells[0]!;
      let minDist = Infinity;
      for (const cell of defenderCells) {
        const dist = Math.hypot(
          cell.x - clickedPixel.x,
          cell.y - clickedPixel.y,
        );
        if (dist < minDist) {
          minDist = dist;
          closestCell = cell;
        }
      }
      return { x: closestCell.x, y: closestCell.y };
    }

    let closestCoastal = coastalCells[0]!;
    let minDist = Infinity;
    for (const cell of coastalCells) {
      const dist = Math.hypot(cell.x - clickedPixel.x, cell.y - clickedPixel.y);
      if (dist < minDist) {
        minDist = dist;
        closestCoastal = cell;
      }
    }

    return { x: closestCoastal.x, y: closestCoastal.y };
  }

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "ATTACK") {
      return state;
    }

    const attackAction = action as AttackAction;
    const attacker = state.nations[action.nationId];
    const defender = state.nations[attackAction.targetNationId];

    if (!attacker || !defender || !defender.isAlive) {
      return state;
    }

    const gridState: GridState =
      (state as { gridState?: GridState }).gridState || new GridState();
    const allCells = gridState.getAllCells();

    const clickedPixel = {
      x: Math.floor(attackAction.infantry % 1024),
      y: Math.floor(attackAction.airForce % 512),
    };

    const targetPixel = this.getClosestCoastalPixel(
      defender.id,
      clickedPixel,
      allCells,
    );

    const closestBase = this.baseFinder.findClosestBase(
      attacker.id,
      targetPixel,
      allCells,
    );

    if (!closestBase) {
      throw new GameError(
        "INVALID_ACTION",
        "Operational military command base not found to initiate theater deployment.",
      );
    }

    const internalDistanceFactor = Math.sqrt(
      attacker.geography.territorySize || 100,
    );
    const infrastructureBonus =
      1.0 + attacker.geography.infrastructureLevel * 0.15;
    const baseLogisticsCost = Math.floor(
      (12000 * internalDistanceFactor) / infrastructureBonus,
    );

    const isLandNeighbor = attacker.geography.landNeighbors.includes(
      defender.id,
    );

    const pixelPathLength = this.pathResolver.calculateNavalDistanceInPixels(
      closestBase,
      targetPixel,
      allCells,
    );

    let navalTransitCost = 0;
    if (pixelPathLength !== null && pixelPathLength > 0) {
      const costPerWaterPixel = 200;
      navalTransitCost = pixelPathLength * costPerWaterPixel;
    } else if (!isLandNeighbor) {
      throw new GameError(
        "INVALID_ACTION",
        "Target is geographically unreachable. No valid land or naval transit routes detected.",
      );
    }

    const totalCampaignCost = baseLogisticsCost + navalTransitCost;

    if (attacker.treasury < totalCampaignCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        `Insufficient sovereign treasury to finance this campaign. Required: $${totalCampaignCost.toLocaleString()} (Internal Logistics: $${baseLogisticsCost.toLocaleString()}, Naval Transit: $${navalTransitCost.toLocaleString()}).`,
      );
    }

    const result = this.orchestrator.executeAttack(
      attacker.id,
      defender.id,
      targetPixel,
      allCells,
    );

    const loggedState = this.logWriter.appendConquestLogs(
      state,
      attacker.id,
      defender.id,
      result.conqueredCells,
      result.capitulatedCells,
    );

    const updatedNations = this.gdpPopUpdater.syncGlobalStats(
      loggedState.nations,
      allCells,
    );

    const finalAttacker = updatedNations[attacker.id];
    if (finalAttacker) {
      updatedNations[attacker.id] = {
        ...finalAttacker,
        treasury: finalAttacker.treasury - totalCampaignCost,
      };
    }

    return {
      ...loggedState,
      nations: updatedNations,
    };
  }
}
