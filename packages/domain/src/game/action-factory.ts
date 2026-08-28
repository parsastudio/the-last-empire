import {
  SetEconomicDoctrineAction,
  RecruitUnitAction,
  BuyArmsMarketAction,
  BuyNavalFleetAction,
  BuyProvinceAction,
  DiplomaticProposalAction,
  RespondDiplomaticProposalAction,
  UpgradeDevelopmentAction,
  ExecuteEspionageAction,
  RepayDebtAction,
  RequestLoanAction,
  CancelRecruitmentAction,
  InvestResearchAction,
  InitiateBattleAction,
} from "@/domain/game/action.schema";
import { UnitType } from "@/domain/military/military.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";
import { EconomicDoctrineStance } from "@/domain/politics/economic-doctrine.schema";

export class ActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public static setEconomicDoctrine(
    nationId: string,
    stance: EconomicDoctrineStance,
  ): SetEconomicDoctrineAction {
    return {
      id: this.createId("doctrine"),
      nationId,
      type: "SET_ECONOMIC_DOCTRINE",
      stance,
    };
  }

  public static recruitUnit(
    nationId: string,
    unitType: UnitType,
    quantity: number,
  ): RecruitUnitAction {
    return {
      id: this.createId("recruit"),
      nationId,
      type: "RECRUIT_UNIT",
      unitType,
      quantity,
    };
  }

  public static buyArmsMarket(
    nationId: string,
    sellerNationId: string,
    unitType: UnitType,
    quantity: number,
  ): BuyArmsMarketAction {
    return {
      id: this.createId("arms-market"),
      nationId,
      type: "BUY_ARMS_MARKET",
      sellerNationId,
      unitType,
      quantity,
    };
  }

  public static buyNavalFleet(
    nationId: string,
    quantity = 1,
  ): BuyNavalFleetAction {
    return {
      id: this.createId("naval-fleet"),
      nationId,
      type: "BUY_NAVAL_FLEET",
      quantity,
    };
  }

  public static buyProvince(
    nationId: string,
    provinceId: number,
  ): BuyProvinceAction {
    return {
      id: this.createId("buy-province"),
      nationId,
      type: "BUY_PROVINCE",
      provinceId,
    };
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

  public static upgradeDevelopment(nationId: string): UpgradeDevelopmentAction {
    return {
      id: this.createId("development"),
      nationId,
      type: "UPGRADE_DEVELOPMENT",
    };
  }

  public static executeEspionage(
    nationId: string,
    targetNationId: string,
    tier: EspionageTier,
  ): ExecuteEspionageAction {
    return {
      id: this.createId("espionage"),
      nationId,
      type: "EXECUTE_ESPIONAGE_OPERATION",
      targetNationId,
      tier,
    };
  }

  public static repayDebt(nationId: string, amount: number): RepayDebtAction {
    return {
      id: this.createId("repay"),
      nationId,
      type: "REPAY_DEBT",
      amount,
    };
  }

  public static requestLoan(
    nationId: string,
    amount: number,
  ): RequestLoanAction {
    return {
      id: this.createId("loan"),
      nationId,
      type: "REQUEST_LOAN",
      amount,
    };
  }

  public static cancelRecruitment(
    nationId: string,
    orderId: string,
  ): CancelRecruitmentAction {
    return {
      id: this.createId("cancel"),
      nationId,
      type: "CANCEL_RECRUITMENT",
      orderId,
    };
  }

  public static investResearch(nationId: string): InvestResearchAction {
    return {
      id: this.createId("research"),
      nationId,
      type: "INVEST_RESEARCH",
    };
  }

  public static initiateBattle(
    nationId: string,
    targetNationId: string,
    dronesToLaunch: number,
    infantryToDeploy?: number,
    armorToDeploy?: number,
    airForceToDeploy?: number,
    targetProvinceId?: number,
    attackType?: "LAND" | "NAVAL",
  ): InitiateBattleAction {
    return {
      id: this.createId("battle"),
      nationId,
      type: "INITIATE_BATTLE",
      targetNationId,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      targetProvinceId,
      attackType,
    };
  }
}
