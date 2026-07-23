import type { Nation } from "@/domain/nation/nation.schema";

export class TributeManager {
  public setTributeDemand(
    nation: Nation,
    targetId: string,
    amount: number,
  ): Nation {
    const relation = nation.relations[targetId];
    if (!relation) {
      return nation;
    }

    return {
      ...nation,
      relations: {
        ...nation.relations,
        [targetId]: {
          ...relation,
          tributePerTurn: amount,
        },
      },
    };
  }

  public processTurnTributes(
    nation: Nation,
    targetNation: Nation,
  ): { nation: Nation; targetNation: Nation } {
    const relation = nation.relations[targetNation.id];
    if (!relation || relation.tributePerTurn <= 0) {
      return { nation, targetNation };
    }

    const actualAmount = Math.max(
      0,
      Math.min(targetNation.treasury, relation.tributePerTurn),
    );

    const updatedTarget: Nation = {
      ...targetNation,
      treasury: targetNation.treasury - actualAmount,
    };

    const updatedSource: Nation = {
      ...nation,
      treasury: nation.treasury + actualAmount,
    };

    return {
      nation: updatedSource,
      targetNation: updatedTarget,
    };
  }
}
