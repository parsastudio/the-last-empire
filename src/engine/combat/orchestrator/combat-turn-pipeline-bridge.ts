import { TurnPhase } from "@/engine/pipeline/turn-phase";
import { GridCombatPhase } from "@/engine/pipeline/grid-combat-phase";

export class CombatTurnPipelineBridge {
  public attachGridCombatPhase(phases: TurnPhase[]): TurnPhase[] {
    const index = phases.findIndex(
      (p) => p.constructor.name === "MilitaryPhase",
    );
    const nextPhases = [...phases];
    if (index > -1) {
      nextPhases.splice(index + 1, 0, new GridCombatPhase());
    } else {
      nextPhases.push(new GridCombatPhase());
    }
    return nextPhases;
  }
}
