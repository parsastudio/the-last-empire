import {
  RecruitUnitAction,
  BuyArmsMarketAction,
  BuyNavalFleetAction,
  InitiateBattleAction,
} from "@/domain/game/actions/schemas/military-action.schema";
import { UnitType } from "@/domain/military/military.schema";

export class MilitaryActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
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
