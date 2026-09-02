import {
  SetEconomicDoctrineAction,
  BuildFactoryAction,
  EquipDomesticMachineryAction,
  InvestIndustrialResearchAction,
  BuyIndustrialEquipmentAction,
  RecruitUnitAction,
  BuyArmsMarketAction,
  BuyNavalFleetAction,
  BuyProvinceAction,
  DiplomaticProposalAction,
  RespondDiplomaticProposalAction,
  SignPeaceSettlementAction,
  ExecuteEspionageAction,
  RepayDebtAction,
  RequestLoanAction,
  InvestResearchAction,
  InitiateBattleAction,
  ResolveDilemmaAction,
  BoostNationalProjectAction,
} from "@/domain/game/action.schema";
import { UnitType } from "@/domain/military/military.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";
import { EconomicDoctrineStance } from "@/domain/politics/economic-doctrine.schema";
import { EconomyActionFactory } from "@/domain/game/actions/factories/economy-action.factory";
import { MilitaryActionFactory } from "@/domain/game/actions/factories/military-action.factory";
import { DiplomacyActionFactory } from "@/domain/game/actions/factories/diplomacy-action.factory";
import { EspionageActionFactory } from "@/domain/game/actions/factories/espionage-action.factory";
import { PoliticsActionFactory } from "@/domain/game/actions/factories/politics-action.factory";
import { DilemmaActionFactory } from "@/domain/game/actions/factories/dilemma-action.factory";
import { ProjectActionFactory } from "@/domain/game/actions/factories/projects/project-action.factory";

export class ActionFactory {
  public static setEconomicDoctrine(
    nationId: string,
    stance: EconomicDoctrineStance,
  ): SetEconomicDoctrineAction {
    return EconomyActionFactory.setEconomicDoctrine(nationId, stance);
  }

  public static buildFactory(
    nationId: string,
    quantity = 1,
    provinceId?: number,
  ): BuildFactoryAction {
    return EconomyActionFactory.buildFactory(nationId, quantity, provinceId);
  }

  public static equipDomesticMachinery(
    nationId: string,
    quantity?: number,
  ): EquipDomesticMachineryAction {
    return EconomyActionFactory.equipDomesticMachinery(nationId, quantity);
  }

  public static investIndustrialResearch(
    nationId: string,
  ): InvestIndustrialResearchAction {
    return EconomyActionFactory.investIndustrialResearch(nationId);
  }

  public static buyIndustrialEquipment(
    nationId: string,
    sellerNationId: string,
    quantity: number,
  ): BuyIndustrialEquipmentAction {
    return EconomyActionFactory.buyIndustrialEquipment(
      nationId,
      sellerNationId,
      quantity,
    );
  }

  public static recruitUnit(
    nationId: string,
    unitType: UnitType,
    quantity: number,
  ): RecruitUnitAction {
    return MilitaryActionFactory.recruitUnit(nationId, unitType, quantity);
  }

  public static buyArmsMarket(
    nationId: string,
    sellerNationId: string,
    unitType: UnitType,
    quantity: number,
  ): BuyArmsMarketAction {
    return MilitaryActionFactory.buyArmsMarket(
      nationId,
      sellerNationId,
      unitType,
      quantity,
    );
  }

  public static buyNavalFleet(
    nationId: string,
    quantity = 1,
  ): BuyNavalFleetAction {
    return MilitaryActionFactory.buyNavalFleet(nationId, quantity);
  }

  public static buyProvince(
    nationId: string,
    targetNationId: string,
    provinceId: number,
    cost = 0,
  ): BuyProvinceAction {
    return EconomyActionFactory.buyProvince(
      nationId,
      targetNationId,
      provinceId,
      cost,
    );
  }

  public static diplomaticProposal(
    nationId: string,
    targetNationId: string,
    proposalType: DiplomaticProposalType,
  ): DiplomaticProposalAction {
    return DiplomacyActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      proposalType,
    );
  }

  public static respondDiplomaticProposal(
    nationId: string,
    proposalId: string,
    accept: boolean,
  ): RespondDiplomaticProposalAction {
    return DiplomacyActionFactory.respondDiplomaticProposal(
      nationId,
      proposalId,
      accept,
    );
  }

  public static signPeaceSettlement(
    nationId: string,
    targetNationId: string,
    proposalId?: string,
  ): SignPeaceSettlementAction {
    return DiplomacyActionFactory.signPeaceSettlement(
      nationId,
      targetNationId,
      proposalId,
    );
  }

  public static sendForeignAid(
    nationId: string,
    targetNationId: string,
  ): DiplomaticProposalAction {
    return DiplomacyActionFactory.sendForeignAid(nationId, targetNationId);
  }

  public static executeEspionage(
    nationId: string,
    targetNationId: string,
    tier: EspionageTier,
  ): ExecuteEspionageAction {
    return EspionageActionFactory.executeEspionage(
      nationId,
      targetNationId,
      tier,
    );
  }

  public static repayDebt(nationId: string, amount: number): RepayDebtAction {
    return EconomyActionFactory.repayDebt(nationId, amount);
  }

  public static requestLoan(
    nationId: string,
    amount: number,
  ): RequestLoanAction {
    return EconomyActionFactory.requestLoan(nationId, amount);
  }

  public static investResearch(nationId: string): InvestResearchAction {
    return PoliticsActionFactory.investResearch(nationId);
  }

  public static initiateBattle(
    nationId: string,
    targetNationId: string,
    dronesToLaunch = 0,
    infantryToDeploy?: number,
    armorToDeploy?: number,
    airForceToDeploy?: number,
    targetProvinceId?: number,
    attackType?: "LAND" | "NAVAL",
  ): InitiateBattleAction {
    return MilitaryActionFactory.initiateBattle(
      nationId,
      targetNationId,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      targetProvinceId,
      attackType,
    );
  }

  public static resolveDilemma(
    nationId: string,
    eventId: string,
    choiceId: string,
  ): ResolveDilemmaAction {
    return DilemmaActionFactory.resolveDilemma(nationId, eventId, choiceId);
  }

  public static boostProject(
    nationId: string,
    projectId: string,
  ): BoostNationalProjectAction {
    return ProjectActionFactory.boostProject(nationId, projectId);
  }
}
