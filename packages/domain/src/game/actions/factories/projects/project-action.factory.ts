import { BoostNationalProjectAction } from "@/domain/game/actions/schemas/projects/project-action.schema";

export class ProjectActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public static boostProject(
    nationId: string,
    projectId: string,
  ): BoostNationalProjectAction {
    return {
      id: this.createId("project-boost"),
      nationId,
      type: "BOOST_NATIONAL_PROJECT",
      projectId,
    };
  }
}
