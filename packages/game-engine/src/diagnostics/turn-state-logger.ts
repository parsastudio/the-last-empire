import {
  GameState,
  NationGettersUtility,
  getNationGdp,
  CountryRegistry,
} from "@geopolitics/domain";

export interface NationTurnSnapshot {
  code: string;
  name: string;
  isAlive: boolean;
  provincesCount: number;
  gdp: number;
  population: number;
  militaryTech: number;
  industrialLevel: number;
}

export interface TurnSummaryReport {
  turn: number;
  totalNationsCount: number;
  aliveNationsCount: number;
  nations: NationTurnSnapshot[];
}

export class TurnStateLogger {
  public static extractSnapshot(state: GameState): TurnSummaryReport {
    const allNationsList = Object.values(state.nations || {});
    const totalNationsCount = allNationsList.length;
    const aliveNationsList = allNationsList.filter((n) => n.isAlive);
    const aliveNationsCount = aliveNationsList.length;

    const nations: NationTurnSnapshot[] = allNationsList.map((nation) => {
      const canonicalCode = CountryRegistry.resolveCanonicalId(nation.id);
      const ownedProvinces = NationGettersUtility.getOwnedProvinces(
        nation.id,
        state.provinces,
      );
      const provincesCount = ownedProvinces.length;
      const gdp = getNationGdp(nation, state.provinces, ownedProvinces);
      const population = NationGettersUtility.getPopulation(
        nation.id,
        state.provinces,
        ownedProvinces,
      );

      return {
        code: canonicalCode,
        name: nation.name,
        isAlive: nation.isAlive,
        provincesCount,
        gdp,
        population,
        militaryTech: Number(nation.military.techLevel.toFixed(1)),
        industrialLevel: nation.industrialLevel,
      };
    });

    nations.sort((a, b) => {
      if (a.isAlive !== b.isAlive) {
        return a.isAlive ? -1 : 1;
      }
      return b.gdp - a.gdp;
    });

    return {
      turn: state.currentTurn,
      totalNationsCount,
      aliveNationsCount,
      nations,
    };
  }

  public static logTurnState(state: GameState): TurnSummaryReport {
    const report = this.extractSnapshot(state);

    if (typeof console !== "undefined") {
      console.group(
        `%c[TURN ${report.turn} DIAGNOSTICS] Total Nations: ${report.totalNationsCount} | Alive: ${report.aliveNationsCount}`,
        "color: #10b981; font-weight: bold; font-size: 12px;",
      );

      if (console.table) {
        console.table(
          report.nations.map((n) => ({
            "کد کشور": n.code,
            "نام کشور": n.name,
            وضعیت: n.isAlive ? "زنده" : "ساقط‌شده",
            "تعداد استان": n.provincesCount,
            "GDP (دلار)": n.gdp.toLocaleString("en-US"),
            جمعیت: n.population.toLocaleString("en-US"),
            "لول دفاعی": n.militaryTech,
            "لول صنعتی": n.industrialLevel,
          })),
        );
      } else {
        console.log(report.nations);
      }

      console.groupEnd();
    }

    return report;
  }
}
