import {
  SetEconomicDoctrineAction,
  BuildFactoryAction,
  EquipDomesticMachineryAction,
  InvestIndustrialResearchAction,
  BuyIndustrialEquipmentAction,
  RepayDebtAction,
  RequestLoanAction,
} from "@/domain/game/actions/schemas/economy-action.schema";
import { EconomicDoctrineStance } from "@/domain/politics/economic-doctrine.schema";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class EconomyActionFactory {
  public static setEconomicDoctrine(
    nationId: string,
    stance: EconomicDoctrineStance,
  ): SetEconomicDoctrineAction {
    return {
      id: GameIdGenerator.generateId("doctrine"),
      nationId,
      type: "SET_ECONOMIC_DOCTRINE",
      stance,
    };
  }

  public static buildFactory(
    nationId: string,
    quantity = 1,
    provinceId?: number,
  ): BuildFactoryAction {
    return {
      id: GameIdGenerator.generateId("build-factory"),
      nationId,
      type: "BUILD_FACTORY",
      quantity,
      provinceId,
    };
  }

  public static equipDomesticMachinery(
    nationId: string,
    quantity?: number,
    sourceTechLevel?: number,
  ): EquipDomesticMachineryAction {
    return {
      id: GameIdGenerator.generateId("equip-machinery"),
      nationId,
      type: "EQUIP_DOMESTIC_MACHINERY",
      quantity,
      sourceTechLevel,
    };
  }

  public static investIndustrialResearch(
    nationId: string,
  ): InvestIndustrialResearchAction {
    return {
      id: GameIdGenerator.generateId("ind-research"),
      nationId,
      type: "INVEST_INDUSTRIAL_RESEARCH",
    };
  }

  public static buyIndustrialEquipment(
    nationId: string,
    sellerNationId: string,
    quantity: number,
    sourceTechLevel?: number,
  ): BuyIndustrialEquipmentAction {
    return {
      id: GameIdGenerator.generateId("buy-equipment"),
      nationId,
      type: "BUY_INDUSTRIAL_EQUIPMENT",
      sellerNationId,
      quantity,
      sourceTechLevel,
    };
  }

  public static repayDebt(nationId: string, amount: number): RepayDebtAction {
    return {
      id: GameIdGenerator.generateId("repay"),
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
      id: GameIdGenerator.generateId("loan"),
      nationId,
      type: "REQUEST_LOAN",
      amount,
    };
  }
}
