import { Nation } from "@geopolitics/domain";

export interface AllianceInterventionResult {
  interveningAllyIds: string[];
  dishonoringAllyIds: string[];
  updatedNations: Record<string, Nation>;
}

export class AllianceInterventionEvaluator {
  public static evaluateAllianceInterventions(
    nationsMap: Record<string, Nation>,
  ): AllianceInterventionResult {
    return {
      interveningAllyIds: [],
      dishonoringAllyIds: [],
      updatedNations: { ...nationsMap },
    };
  }
}
