import {
  DiplomaticProposalAction,
  RespondDiplomaticProposalAction,
  SignPeaceSettlementAction,
} from "@/domain/game/actions/schemas/diplomacy-action.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class DiplomacyActionFactory {
  public static diplomaticProposal(
    nationId: string,
    targetNationId: string,
    proposalType: DiplomaticProposalType,
  ): DiplomaticProposalAction {
    return {
      id: GameIdGenerator.generateId("diplomacy"),
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
      id: GameIdGenerator.generateId("diplomacy-response"),
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
      id: GameIdGenerator.generateId("peace-settlement"),
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
      id: GameIdGenerator.generateId("aid"),
      nationId,
      type: "DIPLOMATIC_PROPOSAL",
      targetNationId,
      proposalType: "SEND_FOREIGN_AID",
    };
  }
}
