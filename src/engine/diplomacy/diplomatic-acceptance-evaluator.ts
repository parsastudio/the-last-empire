import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { PendingDiplomaticProposal } from "@/domain/diplomacy/diplomacy.schema";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";

export class DiplomaticAcceptanceEvaluator {
  public static evaluate(
    proposal: PendingDiplomaticProposal,
    receiver: Nation,
    sender: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): boolean {
    const canonicalSenderId = CountryRegistry.resolveCanonicalId(sender.id);
    const rel =
      receiver.relations[sender.id] || receiver.relations[canonicalSenderId];
    const opinion = rel ? rel.opinion : 0;
    const grudge = rel ? (rel.grudge ?? 0) : 0;

    switch (proposal.proposalType) {
      case "PEACE_TREATY":
        return this.evaluatePeaceAcceptance(
          receiver,
          sender,
          opinion,
          grudge,
          allNations,
          provincesMap,
        );

      case "NON_AGGRESSION_PACT":
        return this.evaluateNonAggressionAcceptance(
          receiver,
          sender,
          opinion,
          grudge,
          provincesMap,
        );

      case "FULL_ALLIANCE":
        return this.evaluateAllianceAcceptance(
          receiver,
          sender,
          opinion,
          grudge,
          allNations,
        );

      default:
        return false;
    }
  }

  private static evaluatePeaceAcceptance(
    receiver: Nation,
    sender: Nation,
    opinion: number,
    grudge: number,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): boolean {
    const receiverPower =
      MilitaryPowerCalculator.calculateEffectivePower(receiver);
    const senderPower = MilitaryPowerCalculator.calculateEffectivePower(sender);
    const receiverStability = receiver.government.stability;

    const isReceiverOverwhelming =
      receiverPower > senderPower * 3.0 &&
      receiverStability >= 65 &&
      grudge >= 50;

    if (isReceiverOverwhelming) {
      return false;
    }

    if (senderPower >= receiverPower * 1.8 || receiverStability < 35) {
      return true;
    }

    let isMultiFrontWar = false;
    for (const [targetId, r] of Object.entries(receiver.relations || {})) {
      if (targetId !== sender.id && r.stance === "WAR") {
        isMultiFrontWar = true;
        break;
      }
    }

    if (isMultiFrontWar) {
      return true;
    }

    const threatResult = AIThreatCalculator.evaluate(
      receiver,
      sender,
      provincesMap,
    );

    if (threatResult.powerRatio >= 0.7 && threatResult.powerRatio <= 1.4) {
      return opinion >= -60;
    }

    return true;
  }

  private static evaluateNonAggressionAcceptance(
    receiver: Nation,
    sender: Nation,
    opinion: number,
    grudge: number,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (grudge >= 40 || opinion < -20) {
      return false;
    }

    if (receiver.warFocusTargetId === sender.id) {
      return false;
    }

    const isAtWar = Object.values(receiver.relations || {}).some(
      (r) => r.stance === "WAR",
    );

    if (isAtWar) {
      return opinion >= -15;
    }

    const threat = AIThreatCalculator.evaluate(receiver, sender, provincesMap);
    if (threat.opportunityScore > 65 && threat.powerRatio < 0.6) {
      return false;
    }

    return opinion >= 0 || sender.globalReputation >= 15;
  }

  private static evaluateAllianceAcceptance(
    receiver: Nation,
    sender: Nation,
    opinion: number,
    grudge: number,
    allNations: Record<string, Nation>,
  ): boolean {
    if (grudge > 15 || sender.globalReputation < -10) {
      return false;
    }

    let hasCommonEnemy = false;
    for (const [thirdId, thirdNation] of Object.entries(allNations)) {
      if (
        !thirdNation.isAlive ||
        thirdId === sender.id ||
        thirdId === receiver.id
      ) {
        continue;
      }

      const senderWar = sender.relations[thirdId]?.stance === "WAR";
      const receiverWar = receiver.relations[thirdId]?.stance === "WAR";

      if (senderWar && receiverWar) {
        hasCommonEnemy = true;
        break;
      }
    }

    if (hasCommonEnemy && opinion >= 20) {
      return true;
    }

    return opinion >= 45 && sender.globalReputation >= 10;
  }
}
