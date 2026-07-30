import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { ContiguousTheaterBfs } from "@/engine/combat/bfs/contiguous-theater-bfs";
import { ConquestCapper } from "@/engine/combat/capping/conquest-capper";
import { SovereignHopBfs } from "@/engine/combat/bfs/sovereign-hop-bfs";
import { CapitulationEngine } from "@/engine/combat/capitulation/capitulation-engine";
import {
  CombatCasualtyCalculator,
  DetailedCasualtyResult,
} from "../math/combat-casualty-calculator";
import { HomelandMilitiaCalculator } from "../math/homeland-militia-calculator";
import { MilitaryStack } from "@/domain/military/military.schema";

export interface ExecutionAttackParams {
  attackerId: string;
  targetCountryId: string;
  targetPixel: Coordinate;
  allCells: GridCell[];
  attackerForcePower: number;
  defenderForcePower: number;
  attackerMilitary: MilitaryStack;
  defenderMilitary: MilitaryStack;
  defenderPopulation?: number;
  defenderStability?: number;
}

export class ConquestOrchestrator {
  private theaterBfs = new ContiguousTheaterBfs();
  private capper = new ConquestCapper();
  private hopBfs = new SovereignHopBfs();
  private capitulation = new CapitulationEngine();
  private casualtyCalculator = new CombatCasualtyCalculator();
  private militiaCalculator = new HomelandMilitiaCalculator();

  public executeAttack(params: ExecutionAttackParams): {
    conqueredCells: GridCell[];
    capitulatedCells: GridCell[];
    casualtyDetails: DetailedCasualtyResult;
    isVictory: boolean;
  } {
    const {
      attackerId,
      targetCountryId,
      targetPixel,
      allCells,
      attackerForcePower,
      defenderForcePower,
      attackerMilitary,
      defenderMilitary,
      defenderPopulation = 10000000,
      defenderStability = 70,
    } = params;

    const militiaPower = this.militiaCalculator.calculateMilitiaGarrisonPower(
      defenderPopulation,
      defenderStability,
    );

    const effectiveDefenderPower = defenderForcePower + militiaPower;
    const isVictory = attackerForcePower > effectiveDefenderPower;

    const targetCellMatch = allCells.find(
      (c) => c.x === targetPixel.x && c.y === targetPixel.y,
    );
    const targetEnclaveId = targetCellMatch ? targetCellMatch.enclaveId : 0;

    const theaterCells = this.theaterBfs.findTheaterCells(
      targetCountryId,
      targetPixel,
      allCells,
    );

    const targetPixelLimit = this.capper.calculateCappedTarget(
      theaterCells.length,
    );

    const isFullTheaterTarget = targetPixelLimit >= theaterCells.length;

    const casualtyDetails = this.casualtyCalculator.calculateDetailedCasualties(
      attackerMilitary,
      defenderMilitary,
      attackerForcePower,
      effectiveDefenderPower,
      isVictory,
      isVictory && isFullTheaterTarget,
    );

    if (!isVictory) {
      return {
        conqueredCells: [],
        capitulatedCells: [],
        casualtyDetails,
        isVictory: false,
      };
    }

    const conqueredCells = this.hopBfs.executeHopBfs(
      targetCountryId,
      targetEnclaveId,
      targetPixel,
      allCells,
      targetPixelLimit,
    );

    const attackerCells = allCells.filter((c) => c.ownerId === attackerId);
    const existingColonyIds = new Set(
      attackerCells.filter((c) => c.enclaveId >= 11).map((c) => c.enclaveId),
    );

    let colonyId = 11;
    while (existingColonyIds.has(colonyId) && colonyId < 63) {
      colonyId++;
    }

    for (const cell of conqueredCells) {
      cell.ownerId = attackerId;
      cell.enclaveId = colonyId;
    }

    const capitulatedCells = this.capitulation.processCapitulation(
      targetCountryId,
      attackerId,
      allCells,
    );

    for (const cell of capitulatedCells) {
      cell.ownerId = attackerId;
      cell.enclaveId = colonyId;
    }

    return {
      conqueredCells,
      capitulatedCells,
      casualtyDetails,
      isVictory: true,
    };
  }
}
