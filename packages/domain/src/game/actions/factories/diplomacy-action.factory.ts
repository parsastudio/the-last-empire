import {
  DiplomaticProposalAction,
  RespondDiplomaticProposalAction,
  SignPeaceSettlementAction,
} from "@/domain/game/actions/schemas/diplomacy-action.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";

export class DiplomacyActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public static diplomaticProposal(
    nationId: string,
    targetNationId: string,
    proposalType: DiplomaticProposalType,
  ): DiplomaticProposalAction {
    return {
      id: this.createId("diplomacy"),
      nationId,
      type: "DIPLOMATIC_PROPOSAL",
      targetNationId,
      proposalType,
    };
  }

  public static respondDiplomaticProposal(
    nationId: string,
    proposalId: string,
    accept: boolean,
  ): RespondDiplomaticProposalAction {
    return {
      id: this.createId("diplomacy-response"),
      nationId,
      type: "RESPOND_DIPLOMATIC_PROPOSAL",
      proposalId,
      accept,
    };
  }

  public static signPeaceSettlement(
    nationId: string,
    targetNationId: string,
    proposalId?: string,
  ): SignPeaceSettlementAction {
    return {
      id: this.createId("peace-settlement"),
      nationId,
      targetNationId,
      type: "SIGN_PEACE_SETTLEMENT",
      proposalId,
    };
  }

  public static sendForeignAid(
    nationId: string,
    targetNationId: string,
  ): DiplomaticProposalAction {
    return {
      id: this.createId("aid"),
      nationId,
      type: "DIPLOMATIC_PROPOSAL",
      targetNationId,
      proposalType: "SEND_FOREIGN_AID",
    };
  }
}
