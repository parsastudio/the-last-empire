export type TurnLogLevel = "INFO" | "WARNING" | "CRITICAL" | "COMBAT";

export interface TurnLogEntry {
  id: string;
  turn: number;
  timestamp: number;
  sourceNationId: string;
  targetNationId?: string;
  level: TurnLogLevel;
  message: string;
  metadata?: Record<string, string | number | boolean>;
}
