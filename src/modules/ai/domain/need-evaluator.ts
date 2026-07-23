import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { AINeedEvaluation } from "@/modules/ai/schemas/ai.schema";

export class NeedEvaluator {
  public evaluateNeeds(nation: Nation): AINeedEvaluation {
    const needTreasury =
      nation.treasury < 10000 ? 1.0 : nation.treasury < 50000 ? 0.5 : 0.1;

    const totalMilitaryCount =
      nation.military.infantry +
      nation.military.airForce +
      nation.military.droneMissile;
    const needMilitary =
      totalMilitaryCount < 50 ? 1.0 : totalMilitaryCount < 200 ? 0.6 : 0.2;

    const peaceAlliances = Object.values(nation.relations).filter(
      (r) => r.stance === "ALLIANCE",
    ).length;
    const needDiplomacy =
      peaceAlliances === 0 ? 0.8 : peaceAlliances < 2 ? 0.4 : 0.1;

    const needStability = (100 - nation.government.stability) / 100;

    return {
      needTreasury,
      needMilitary,
      needDiplomacy,
      needStability,
    };
  }
}
