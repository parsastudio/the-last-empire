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

export class EconomyActionFactory {
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

  public static buildFactory(
    nationId: string,
    quantity = 1,
    provinceId?: number,
  ): BuildFactoryAction {
    return {
      id: this.createId("build-factory"),
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
      id: this.createId("equip-machinery"),
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
      id: this.createId("ind-research"),
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
      id: this.createId("buy-equipment"),
      nationId,
      type: "BUY_INDUSTRIAL_EQUIPMENT",
      sellerNationId,
      quantity,
      sourceTechLevel,
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
}
