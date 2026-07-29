import { GameAction } from "@/domain/game/action.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";

export class ActionPrioritySorter {
  public sortActions(
    actions: readonly GameAction[],
    prng: SeededRandom,
  ): GameAction[] {
    const rawQueue = [...actions];

    const priority1 = rawQueue.filter((a) =>
      [
        "DECLARE_WAR",
        "CHANGE_GOVERNMENT",
        "ACTIVATE_ABILITY",
        "SET_TAX_RATE",
        "SET_TARIFF_RATE",
      ].includes(a.type),
    );
    const priority2 = rawQueue.filter((a) => a.type === "TRADE_RESOURCES");
    const priority3 = rawQueue.filter((a) =>
      [
        "RECRUIT_UNIT",
        "INVEST_INFRASTRUCTURE",
        "UPGRADE_INDUSTRIAL_LEVEL",
        "UNLOCK_DOCTRINE",
        "INVEST_RESEARCH",
        "ANTI_CORRUPTION_DRIVE",
        "REPAY_DEBT",
        "REQUEST_LOAN",
        "CANCEL_RECRUITMENT",
        "DISBAND_UNIT",
        "DIPLOMATIC_PROPOSAL",
        "FUND_PROXY_INFLUENCE",
      ].includes(a.type),
    );
    const priority4 = rawQueue.filter((a) => a.type === "ATTACK");

    const knownTypes = new Set([
      ...priority1.map((a) => a.type),
      ...priority2.map((a) => a.type),
      ...priority3.map((a) => a.type),
      ...priority4.map((a) => a.type),
    ]);

    const fallback = rawQueue.filter((a) => !knownTypes.has(a.type));

    const shuffledTrades = [...priority2];
    for (let i = shuffledTrades.length - 1; i > 0; i--) {
      const j = Math.floor(prng.nextFloat() * (i + 1));
      const temp = shuffledTrades[i];
      const target = shuffledTrades[j];
      if (temp && target) {
        shuffledTrades[i] = target;
        shuffledTrades[j] = temp;
      }
    }

    return [
      ...priority1,
      ...shuffledTrades,
      ...priority3,
      ...fallback,
      ...priority4,
    ];
  }
}
