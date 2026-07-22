export interface CombatCasualties {
  attackerKilledInfantry: number;
  attackerKilledAirForce: number;
  defenderKilledInfantry: number;
  defenderKilledAirForce: number;
}

export interface BattleReport {
  battleId: string;
  turn: number;
  attackerId: string;
  defenderId: string;
  attackerWon: boolean;
  attackerScore: number;
  defenderScore: number;
  casualties: CombatCasualties;
}

export interface WarState {
  attackerId: string;
  defenderId: string;
  turnsActive: number;
  warExhaustionAttacker: number;
  warExhaustionDefender: number;
}
