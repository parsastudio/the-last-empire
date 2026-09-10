import {
  RecruitUnitAction,
  BuyArmsMarketAction,
  BuyNavalFleetAction,
  InitiateBattleAction,
} from "@/domain/game/actions/schemas/military-action.schema";
import { UnitType } from "@/domain/military/military.schema";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class MilitaryActionFactory {
  public static recruitUnit(
    nationId: string,
    unitType: UnitType,
    quantity: number,
  ): RecruitUnitAction {
    return {
      id: GameIdGenerator.generateId("recruit"),
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
      id: GameIdGenerator.generateId("arms-market"),
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
      id: GameIdGenerator.generateId("naval-fleet"),
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
      id: GameIdGenerator.generateId("battle"),
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
