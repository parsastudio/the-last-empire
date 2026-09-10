import { BoostNationalProjectAction } from "@/domain/game/actions/schemas/projects/project-action.schema";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class ProjectActionFactory {
  public static boostProject(
    nationId: string,
    projectId: string,
  ): BoostNationalProjectAction {
    return {
      id: GameIdGenerator.generateId("project-boost"),
      nationId,
      type: "BOOST_NATIONAL_PROJECT",
      projectId,
    };
  }
}
