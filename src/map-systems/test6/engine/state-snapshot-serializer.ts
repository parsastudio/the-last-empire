import { GameState } from "@/domain/game/game-state.schema";
import { StateSerializer } from "@/infrastructure/storage/state-serializer";

export class StateSnapshotSerializer {
  private serializer = new StateSerializer();

  public serializeSnapshot(state: GameState): string {
    return this.serializer.serialize(state);
  }

  public deserializeSnapshot(serialized: string): GameState {
    return this.serializer.deserialize(serialized);
  }
}
