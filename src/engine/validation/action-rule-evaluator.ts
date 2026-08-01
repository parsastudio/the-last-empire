import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { Nation } from "@/domain/nation/nation.schema";

export class ActionRuleEvaluator {
  public static evaluate(state: GameState, action: GameAction): void {
    const source = state.nations[action.nationId];
    if (!source) return;

    switch (action.type) {
      case "SET_TAX_RATE":
        if (action.newRate < 0 || action.newRate > 50) {
          throw new GameError(
            "INVALID_ACTION",
            "Tax rate must be between 0 and 50",
          );
        }
        break;

      case "SET_TARIFF_RATE":
        if (action.newRate < 0 || action.newRate > 100) {
          throw new GameError(
            "INVALID_ACTION",
            "Tariff rate must be between 0 and 100",
          );
        }
        break;

      case "SET_RESEARCH_BUDGET":
        if (action.newRate < 0 || action.newRate > 30) {
          throw new GameError(
            "INVALID_ACTION",
            "Research budget rate must be between 0 and 30",
          );
        }
        break;

      case "RECRUIT_UNIT":
        if (action.quantity <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "Recruitment quantity must be positive",
          );
        }
        if (
          action.unitType === "AIR_FORCE" ||
          action.unitType === "DRONE_MISSILE"
        ) {
          const reqSteel = action.quantity * 2;
          if (source.resources.steel < reqSteel) {
            throw new GameError(
              "INSUFFICIENT_RESOURCES",
              `Requires at least ${reqSteel} steel`,
            );
          }
        }
        break;

      case "REQUEST_LOAN":
        if (action.amount <= 0) {
          throw new GameError("INVALID_ACTION", "Loan amount must be positive");
        }
        if (
          source.activeModifiers.some((m) => m.id === "bankruptcy-debt-holiday")
        ) {
          throw new GameError(
            "INVALID_ACTION",
            "Cannot request loan during bankruptcy restructuring",
          );
        }
        break;

      case "REPAY_DEBT":
        if (action.amount <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "Repayment amount must be positive",
          );
        }
        if (source.nationalDebt <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "No outstanding national debt to repay",
          );
        }
        if (source.treasury < action.amount) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "Insufficient treasury to repay debt",
          );
        }
        break;

      case "TRADE_RESOURCES":
        if (action.amount <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "Trade amount must be positive",
          );
        }
        if (action.isBuy) {
          const price = state.marketPrices?.[action.resourceType] || 25000000;
          const cost = action.amount * price;
          if (source.treasury < cost) {
            throw new GameError(
              "INSUFFICIENT_FUNDS",
              "Insufficient treasury for trade",
            );
          }
        } else {
          if (source.resources[action.resourceType] < action.amount) {
            throw new GameError(
              "INSUFFICIENT_RESOURCES",
              "Insufficient stock to sell",
            );
          }
        }
        break;

      case "FUND_PROXY_INFLUENCE": {
        const target = state.nations[action.targetNationId];
        if (!target || !target.isAlive) {
          throw new GameError(
            "NATION_NOT_FOUND",
            "Target nation is not available",
          );
        }
        const reqBudget = Math.floor(target.gdp * 0.01);
        if (source.treasury < reqBudget) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "Insufficient treasury for proxy operation",
          );
        }
        break;
      }

      case "UNLOCK_DOCTRINE":
        if (source.doctrines.doctrinePoints < 3) {
          throw new GameError("INVALID_ACTION", "Insufficient doctrine points");
        }
        break;

      case "ANTI_CORRUPTION_DRIVE":
      case "INVEST_DIPLOMACY":
        if (action.amount <= 0) {
          throw new GameError("INVALID_ACTION", "Amount must be positive");
        }
        if (source.treasury < action.amount) {
          throw new GameError("INSUFFICIENT_FUNDS", "Insufficient treasury");
        }
        break;

      case "DISBAND_UNIT": {
        if (action.quantity <= 0) {
          throw new GameError("INVALID_ACTION", "Quantity must be positive");
        }
        const count =
          action.unitType === "INFANTRY"
            ? source.military.infantry
            : action.unitType === "AIR_FORCE"
              ? source.military.airForce
              : source.military.droneMissile;
        if (count < action.quantity) {
          throw new GameError(
            "INVALID_ACTION",
            "Cannot disband more units than available",
          );
        }
        break;
      }

      case "CANCEL_RECRUITMENT":
        if (!source.recruitmentQueue.some((o) => o.id === action.orderId)) {
          throw new GameError(
            "INVALID_ACTION",
            "Order not found in recruitment queue",
          );
        }
        break;

      case "ACTIVATE_ABILITY":
        this.evaluateAbility(source, action.abilityType);
        break;

      case "INITIATE_BATTLE": {
        if (action.nationId === action.targetNationId) {
          throw new GameError("INVALID_ACTION", "Cannot attack self");
        }
        const target = state.nations[action.targetNationId];
        if (!target || !target.isAlive) {
          throw new GameError("NATION_NOT_FOUND", "Target nation not alive");
        }
        if (source.military.infantry <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "Requires at least 1 infantry unit to launch an attack",
          );
        }
        if (action.dronesToLaunch > source.military.droneMissile) {
          throw new GameError(
            "INSUFFICIENT_RESOURCES",
            "Drones to launch exceeds available stock",
          );
        }

        const totalForceCost =
          source.military.infantry * 250000000 +
          source.military.airForce * 1000000000 +
          action.dronesToLaunch * 1500000000;

        const deploymentFivePct = totalForceCost * 0.05;
        const deploymentMoneyCost = Math.floor(deploymentFivePct);
        const oilPrice = state.marketPrices?.oil || 25000000;
        const deploymentOilCost = Math.max(
          1,
          Math.ceil(deploymentFivePct / oilPrice),
        );

        if (source.treasury < deploymentMoneyCost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            `Insufficient treasury for troop deployment. Required: $${deploymentMoneyCost.toLocaleString("en-US")}`,
          );
        }

        if (source.resources.oil < deploymentOilCost) {
          throw new GameError(
            "INSUFFICIENT_RESOURCES",
            `Insufficient oil blocks for troop deployment. Required: ${deploymentOilCost} oil blocks`,
          );
        }
        break;
      }
    }
  }

  private static evaluateAbility(source: Nation, abilityType: string): void {
    const mods = source.activeModifiers;
    switch (abilityType) {
      case "DIPLOMATIC_SUMMIT":
        if (source.government.type !== "DEMOCRACY") {
          throw new GameError(
            "INVALID_ACTION",
            "Diplomatic Summit requires Democracy",
          );
        }
        if (source.treasury < 20000) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "20,000 treasury required for Summit",
          );
        }
        if (mods.some((m) => m.id === "cooldown-diplomatic-summit")) {
          throw new GameError("INVALID_ACTION", "Summit is on cooldown");
        }
        break;
      case "MARTIAL_LAW":
        if (source.government.type !== "DICTATORSHIP") {
          throw new GameError(
            "INVALID_ACTION",
            "Martial Law requires Dictatorship",
          );
        }
        if (mods.some((m) => m.id === "cooldown-martial-law")) {
          throw new GameError("INVALID_ACTION", "Martial Law is on cooldown");
        }
        break;
      case "INDUSTRIAL_MOBILIZATION":
        if (source.government.type !== "COMMUNISM") {
          throw new GameError(
            "INVALID_ACTION",
            "Industrial Mobilization requires Communism",
          );
        }
        if (source.resources.manpower < 50) {
          throw new GameError(
            "INSUFFICIENT_RESOURCES",
            "Requires at least 50 manpower",
          );
        }
        if (mods.some((m) => m.id === "cooldown-industrial-mobilization")) {
          throw new GameError("INVALID_ACTION", "Mobilization is on cooldown");
        }
        break;
      case "ROYAL_DECREE":
        if (source.government.type !== "MONARCHY") {
          throw new GameError(
            "INVALID_ACTION",
            "Royal Decree requires Monarchy",
          );
        }
        if (source.treasury < 40000) {
          throw new GameError("INSUFFICIENT_FUNDS", "40,000 treasury required");
        }
        if (mods.some((m) => m.id === "cooldown-royal-decree")) {
          throw new GameError("INVALID_ACTION", "Royal Decree is on cooldown");
        }
        break;
      case "WAR_ALERT":
        if (source.government.type !== "FASCISM") {
          throw new GameError("INVALID_ACTION", "War Alert requires Fascism");
        }
        if (mods.some((m) => m.id === "cooldown-war-alert")) {
          throw new GameError("INVALID_ACTION", "War Alert is on cooldown");
        }
        break;
    }
  }
}
