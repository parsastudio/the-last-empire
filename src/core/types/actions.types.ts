import type { GovernmentType } from "./government.types";
import type { UnitType } from "./military.types";
import type { DiplomaticProposalType } from "./diplomacy.types";

export interface BaseAction {
  id: string;
  nationId: string;
}

export interface SetTaxRateAction extends BaseAction {
  type: "SET_TAX_RATE";
  newRate: number;
}

export interface ChangeGovernmentAction extends BaseAction {
  type: "CHANGE_GOVERNMENT";
  newGovernment: GovernmentType;
}

export interface RecruitUnitAction extends BaseAction {
  type: "RECRUIT_UNIT";
  unitType: UnitType;
  quantity: number;
}

export interface DeclareWarAction extends BaseAction {
  type: "DECLARE_WAR";
  targetNationId: string;
}

export interface AttackAction extends BaseAction {
  type: "ATTACK";
  targetNationId: string;
  infantry: number;
  airForce: number;
  navy: number;
  droneMissile: number;
}

export interface DiplomaticProposalAction extends BaseAction {
  type: "DIPLOMATIC_PROPOSAL";
  targetNationId: string;
  proposalType: DiplomaticProposalType;
  tributeAmount?: number;
}

export interface TradeResourcesAction extends BaseAction {
  type: "TRADE_RESOURCES";
  resourceType: "oil" | "steel";
  isBuy: boolean;
  amount: number;
}

export interface UpgradeIndustrialLevelAction extends BaseAction {
  type: "UPGRADE_INDUSTRIAL_LEVEL";
}

export interface InvestInfrastructureAction extends BaseAction {
  type: "INVEST_INFRASTRUCTURE";
}

export type GameAction =
  | SetTaxRateAction
  | ChangeGovernmentAction
  | RecruitUnitAction
  | DeclareWarAction
  | AttackAction
  | DiplomaticProposalAction
  | TradeResourcesAction
  | UpgradeIndustrialLevelAction
  | InvestInfrastructureAction;
