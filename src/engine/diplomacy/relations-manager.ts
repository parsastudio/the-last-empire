import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentFrictionCalculator } from "./relations/government-friction.calculator";
import { RelationsImprovementHandler } from "./relations/relations-improvement.handler";
import { InsultActionHandler } from "./relations/insult-action.handler";

export class RelationsManager {
  private frictionCalculator = new GovernmentFrictionCalculator();
  private improvementHandler = new RelationsImprovementHandler();
  private insultHandler = new InsultActionHandler();

  public calculateGovernmentFriction(nationA: Nation, nationB: Nation): number {
    return this.frictionCalculator.calculateGovernmentFriction(
      nationA,
      nationB,
    );
  }

  public improveRelations(
    nationA: Nation,
    targetId: string,
    cost = 10000,
  ): Nation {
    return this.improvementHandler.improveRelations(nationA, targetId, cost);
  }

  public sendInsult(nationA: Nation, targetId: string): Nation {
    return this.insultHandler.sendInsult(nationA, targetId);
  }
}
