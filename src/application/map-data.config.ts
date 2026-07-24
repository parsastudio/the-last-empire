export const STATIC_ADJACENCY_LIST: Record<string, string[]> = {
  IRN_P1: ["IRQ_P1", "TUR_P1", "AFG_P1", "PAK_P1", "AZE_P1", "ARM_P1"],
  USA_P1: ["CAN_P1", "MEX_P1"],
  CAN_P1: ["USA_P1"],
  MEX_P1: ["USA_P1"],
  AFG_P1: ["IRN_P1", "PAK_P1", "CHN_P1"],
  PAK_P1: ["IRN_P1", "AFG_P1", "IND_P1"],
  IRQ_P1: ["IRN_P1", "TUR_P1", "SAU_P1", "SYR_P1"],
  TUR_P1: ["IRN_P1", "IRQ_P1", "SYR_P1"],
  SAU_P1: ["YEM_P1", "OMN_P1", "IRQ_P1", "ARE_P1"],
  CHN_P1: ["RUS_P1", "IND_P1", "AFG_P1", "PAK_P1"],
  RUS_P1: ["CHN_P1", "UKR_P1", "FIN_P1"],
  IND_P1: ["PAK_P1", "CHN_P1"],
  BRA_P1: ["ARG_P1", "COL_P1"],
};

export const CENTROIDS: Record<string, { x: number; y: number }> = {
  USA: { x: 280, y: 190 },
  CAN: { x: 280, y: 100 },
  RUS: { x: 780, y: 120 },
  DEU: { x: 570, y: 180 },
  IRN: { x: 700, y: 240 },
  SAU: { x: 670, y: 270 },
  IRQ: { x: 670, y: 235 },
};
