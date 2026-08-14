import {
  SetTaxRateAction,
  SetTariffRateAction,
  RecruitUnitAction,
  BuyArmsMarketAction,
  DiplomaticProposalAction,
  UpgradeIndustrialLevelAction,
  InvestInfrastructureAction,
  ExecuteEspionageAction,
  UnlockDoctrineAction,
  RepayDebtAction,
  RequestLoanAction,
  CancelRecruitmentAction,
  InvestResearchAction,
  InitiateBattleAction,
} from "@/domain/game/action.schema";
import { UnitType } from "@/domain/military/military.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";

export class ActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public static setTaxRate(
    nationId: string,
    newRate: number,
  ): SetTaxRateAction {
    return {
      id: this.createId("tax"),
      nationId,
      type: "SET_TAX_RATE",
      newRate,
    };
  }

  public static setTariffRate(
    nationId: string,
    newRate: number,
  ): SetTariffRateAction {
    return {
      id: this.createId("tariff"),
      nationId,
      type: "SET_TARIFF_RATE",
      newRate,
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

  public static upgradeIndustrialLevel(
    nationId: string,
  ): UpgradeIndustrialLevelAction {
    return {
      id: this.createId("industrial"),
      nationId,
      type: "UPGRADE_INDUSTRIAL_LEVEL",
    };
  }

  public static investInfrastructure(
    nationId: string,
  ): InvestInfrastructureAction {
    return {
      id: this.createId("infra"),
      nationId,
      type: "INVEST_INFRASTRUCTURE",
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

  public static unlockDoctrine(
    nationId: string,
    doctrineId: string,
  ): UnlockDoctrineAction {
    return {
      id: this.createId("doctrine"),
      nationId,
      type: "UNLOCK_DOCTRINE",
      doctrineId,
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
      airForceToDeploy,
      targetProvinceId,
      attackType,
    };
  }
}
