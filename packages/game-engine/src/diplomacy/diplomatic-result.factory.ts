import { DiplomaticProposalType } from "@geopolitics/domain";

export interface DiplomaticActionResultData {
  proposalType: DiplomaticProposalType;
  accepted: boolean;
  targetNationId: string;
  targetName: string;
  targetFlagCode: string;
  reputationChange?: number;
  message?: string;
  defenseEvent?: unknown;
  retaliatingGuarantors?: unknown[];
}

export class DiplomaticResultFactory {
  public static create(
    params: DiplomaticActionResultData,
  ): DiplomaticActionResultData {
    return {
      proposalType: params.proposalType,
      accepted: params.accepted,
      targetNationId: params.targetNationId,
      targetName: params.targetName,
      targetFlagCode: params.targetFlagCode,
      reputationChange: params.reputationChange ?? 0,
      message: params.message,
      defenseEvent: params.defenseEvent,
      retaliatingGuarantors: params.retaliatingGuarantors,
    };
  }
}
