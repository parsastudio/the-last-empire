import { DeltaPatch } from "@/domain/events/domain-event.schema";
import { GameState } from "@/domain/game/game-state.schema";

export class DeltaPatchEngine {
  public createDiff(
    previousState: GameState,
    nextState: GameState,
  ): DeltaPatch[] {
    const patches: DeltaPatch[] = [];
    this.diffObjects(
      previousState as unknown as Record<string, unknown>,
      nextState as unknown as Record<string, unknown>,
      "",
      patches,
    );
    return patches;
  }

  public applyPatches(baseState: GameState, patches: DeltaPatch[]): GameState {
    const cloned = JSON.parse(JSON.stringify(baseState)) as Record<
      string,
      unknown
    >;

    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i];
      if (!patch) continue;
      this.applySinglePatch(cloned, patch);
    }

    return cloned as unknown as GameState;
  }

  private diffObjects(
    prev: Record<string, unknown>,
    next: Record<string, unknown>,
    currentPath: string,
    patches: DeltaPatch[],
  ): void {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (!key) continue;

      const path = `${currentPath}/${key}`;
      const prevVal = prev[key];
      const nextVal = next[key];

      if (!(key in prev)) {
        patches.push({ op: "add", path, value: nextVal });
      } else if (
        typeof prevVal === "object" &&
        prevVal !== null &&
        typeof nextVal === "object" &&
        nextVal !== null &&
        !Array.isArray(prevVal) &&
        !Array.isArray(nextVal)
      ) {
        this.diffObjects(
          prevVal as Record<string, unknown>,
          nextVal as Record<string, unknown>,
          path,
          patches,
        );
      } else if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
        patches.push({ op: "replace", path, value: nextVal });
      }
    }

    for (let i = 0; i < prevKeys.length; i++) {
      const key = prevKeys[i];
      if (!key) continue;

      if (!(key in next)) {
        const path = `${currentPath}/${key}`;
        patches.push({ op: "remove", path });
      }
    }
  }

  private applySinglePatch(
    obj: Record<string, unknown>,
    patch: DeltaPatch,
  ): void {
    const segments = patch.path.split("/").filter(Boolean);
    if (segments.length === 0) return;

    let target: Record<string, unknown> = obj;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (!seg) continue;

      if (!(seg in target) || typeof target[seg] !== "object") {
        target[seg] = {};
      }
      target = target[seg] as Record<string, unknown>;
    }

    const lastSeg = segments[segments.length - 1];
    if (!lastSeg) return;

    if (patch.op === "remove") {
      delete target[lastSeg];
    } else {
      target[lastSeg] = patch.value;
    }
  }
}
