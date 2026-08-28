import { Nation, Province } from "@geopolitics/domain";

export interface AllianceInterventionResult {
  interveningAllyIds: string[];
  dishonoringAllyIds: string[];
  updatedNations: Record<string, Nation>;
}

export class AllianceInterventionEvaluator {
  public static evaluateAllianceInterventions(
    _attacker: Nation,
    _defender: Nation,
    nationsMap: Record<string, Nation>,
    _provincesMap?: Record<string, Province>,
  ): AllianceInterventionResult {
    return {
      interveningAllyIds: [],
      dishonoringAllyIds: [],
      updatedNations: { ...nationsMap },
    };
  }
}
