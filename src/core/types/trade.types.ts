export interface TradeRoute {
  partnerId: string;
  isPeaceful: boolean;
  baseTradeValue: number;
}

export interface TariffRate {
  rate: number;
  gdpGrowthPenalty: number;
}

export interface LoanAgreement {
  id: string;
  lenderId: string;
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  turnsRemaining: number;
}

export interface ResourceMarket {
  oilPrice: number;
  steelPrice: number;
  oilSupply: number;
  oilDemand: number;
  steelSupply: number;
  steelDemand: number;
}
