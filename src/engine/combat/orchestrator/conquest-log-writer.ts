import { GameState } from "@/domain/game/game-state.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { CombatEventLogger } from "@/engine/combat/orchestrator/combat-event-logger";
import { DetailedCasualtyResult } from "../math/combat-casualty-calculator";

export interface DetailedConquestLogData {
  conquered: GridCell[];
  capitulated: GridCell[];
  casualtyDetails: DetailedCasualtyResult;
  isVictory: boolean;
}

export class ConquestLogWriter {
  private logger = new CombatEventLogger();

  public appendConquestLogs(
    state: GameState,
    attackerId: string,
    defenderId: string,
    data: DetailedConquestLogData,
  ): GameState {
    const totalPixels = data.conquered.length + data.capitulated.length;
    const conqueredAreaSqKm = Math.round(totalPixels * 86.3);

    const attackerName = state.nations[attackerId]?.name || attackerId;
    const defenderName = state.nations[defenderId]?.name || defenderId;

    let summary = "";
    if (data.isVictory) {
      summary = `نیروهای ${attackerName} در عملیات تهاجمی موفق به تصرف ${conqueredAreaSqKm.toLocaleString("fa-IR")} کیلومتر مربع از اراضی ${defenderName} شدند.`;
    } else {
      summary = `پدافند و نیروهای رزمی ${defenderName} پاتک سنگینی اجرا کرده و تهاجم نیروهای ${attackerName} را دفع کردند.`;
    }

    const metadata: Record<string, string | number | boolean> = {
      attackerLostInfantry: data.casualtyDetails.attackerLostStack.infantry,
      attackerLostAir: data.casualtyDetails.attackerLostStack.airForce,
      attackerLostDrone: data.casualtyDetails.attackerLostStack.droneMissile,
      defenderLostInfantry: data.casualtyDetails.defenderLostStack.infantry,
      defenderLostAir: data.casualtyDetails.defenderLostStack.airForce,
      defenderLostDrone: data.casualtyDetails.defenderLostStack.droneMissile,
      conqueredAreaSqKm,
      isVictory: data.isVictory,
    };

    const entry = this.logger.createLogEntry(
      state.currentTurn,
      attackerId,
      defenderId,
      summary,
    );

    entry.metadata = metadata;

    return {
      ...state,
      turnLogs: [...state.turnLogs, entry],
    };
  }
}
