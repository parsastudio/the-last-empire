export interface TradeRoute {
  partnerId: string;
  isPeaceful: boolean;
  baseTradeValue: number;
}

export interface ImfLoan {
  id: string;
  principalAmount: number;
  interestRate: number;
  turnsRemaining: number;
  totalRepayable: number;
}

export interface ResourceMarket {
  oilPrice: number;
  steelPrice: number;
  oilSupply: number;
  oilDemand: number;
  steelSupply: number;
  steelDemand: number;
}
