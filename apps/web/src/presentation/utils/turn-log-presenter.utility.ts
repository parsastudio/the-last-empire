import { TurnLogEntry } from "@geopolitics/domain";

export interface TurnLogPresenterOptions {
  tEvents: (key: string, values?: Record<string, string | number>) => string;
  tDiplomacy: (key: string, values?: Record<string, string | number>) => string;
  tDilemmas?: (key: string, values?: Record<string, string | number>) => string;
  formatCurrency: (value: number, compact?: boolean) => string;
  toDigits: (value: number | string) => string;
  formatCountryName: (code: string) => string;
  sourceName: string;
  targetName: string;
}

export class TurnLogPresenterUtility {
  private static resolveProposalLabel(
    treatyType: unknown,
    tDiplomacy: (key: string) => string,
  ): string {
    const safeType = String(treatyType || "PEACE_TREATY");
    try {
      const label = tDiplomacy(`proposalTypes.${safeType}`);
      return label || safeType;
    } catch {
      return safeType;
    }
  }

  public static format(
    log: TurnLogEntry,
    options: TurnLogPresenterOptions,
  ): string {
    const params = log.params || {};
    const {
      tEvents,
      tDiplomacy,
      tDilemmas,
      formatCurrency,
      toDigits,
      formatCountryName,
      sourceName,
      targetName,
    } = options;

    switch (log.eventCode) {
      case "WAR_DECLARED": {
        if (params["isRetaliation"]) {
          const protectedTarget = params["protectedTargetId"]
            ? formatCountryName(String(params["protectedTargetId"]))
            : String(params["protectedTargetName"] || targetName);

          return tEvents("WAR_DECLARED_RETALIATION", {
            source: sourceName,
            target: protectedTarget,
          });
        }
        return tEvents("WAR_DECLARED", {
          source: sourceName,
          target: targetName,
        });
      }

      case "VICTORY_ACHIEVED":
        if (params["reason"] === "HUMAN_PLAYER_DEFEATED") {
          return tEvents("HUMAN_DEFEATED", { source: sourceName });
        }
        return tEvents("VICTORY_ACHIEVED", { source: sourceName });

      case "COALITION_FORMED":
        return tEvents("COALITION_FORMED", { source: sourceName });

      case "BATTLE_TACTICAL_REPORT":
      case "BATTLE_GLOBAL_NEWS": {
        const outcome = String(params["outcome"] || "VICTORY");
        const ratio = toDigits(String(params["ratio"] || "1"));
        if (outcome === "CAPITULATION") {
          return tEvents("BATTLE_CAPITULATION", {
            source: sourceName,
            target: targetName,
            ratio,
          });
        }
        if (outcome === "DEFENDED") {
          return tEvents("BATTLE_DEFENDED", {
            source: sourceName,
            target: targetName,
          });
        }
        return tEvents("BATTLE_VICTORY", {
          source: sourceName,
          target: targetName,
        });
      }

      case "NATION_ANNEXED":
        return tEvents("NATION_ANNEXED", {
          source: sourceName,
          target: targetName,
        });

      case "NATION_COLLAPSED":
        return tEvents("NATION_COLLAPSED", { source: sourceName });

      case "NATION_BANKRUPTCY":
        return tEvents("NATION_BANKRUPTCY", { source: sourceName });

      case "DIPLOMATIC_PROPOSAL_SENT":
      case "TREATY_ACCEPTED":
      case "TREATY_REJECTED": {
        const proposal = this.resolveProposalLabel(
          params["treatyType"],
          tDiplomacy,
        );
        return tEvents(log.eventCode, {
          source: sourceName,
          target: targetName,
          proposal,
        });
      }

      case "TREATY_CANCELLED":
        return tEvents("TREATY_CANCELLED", {
          source: sourceName,
          target: targetName,
        });

      case "SECURITY_GUARANTEE_SIGNED":
        return tEvents("SECURITY_GUARANTEE_SIGNED", {
          source: sourceName,
          target: targetName,
        });

      case "SECURITY_GUARANTEE_CANCELLED":
        return tEvents("SECURITY_GUARANTEE_CANCELLED", {
          source: sourceName,
          target: targetName,
        });

      case "DEFENSE_PACT_NEUTRALITY":
        return tEvents("DEFENSE_PACT_NEUTRALITY", { source: sourceName });

      case "DEFENSE_PACT_REFUSAL_COMPENSATION": {
        const amount = formatCurrency(
          Number(params["compensationAmount"] || 0),
        );
        return tEvents("DEFENSE_PACT_REFUSAL_COMPENSATION", {
          source: sourceName,
          amount,
        });
      }

      case "EMERGENCY_PROTECTORATE_SIGNED":
        return tEvents("EMERGENCY_PROTECTORATE_SIGNED", {
          source: sourceName,
          target: targetName,
        });

      case "EMERGENCY_PROTECTORATE_CANCELLED":
        return tEvents("EMERGENCY_PROTECTORATE_CANCELLED", {
          source: sourceName,
          target: targetName,
        });

      case "FOREIGN_AID_SENT": {
        const amount = formatCurrency(Number(params["amount"] || 0));
        return tEvents("FOREIGN_AID_SENT", {
          source: sourceName,
          target: targetName,
          amount,
        });
      }

      case "ESPIONAGE_OPERATION":
        return tEvents("ESPIONAGE_OPERATION", {
          target: targetName,
          details: String(params["details"] || log.message || ""),
        });

      case "ARMS_TRADE": {
        const amount = formatCurrency(Number(params["amount"] || 0));
        const role = params["role"] === "SELLER" ? "SELL" : "BUY";
        const tradeType =
          params["tradeType"] === "MACHINERY" ? "MACHINERY" : "ARMS";
        const eventKey = `${tradeType}_TRADE_${role}`;
        return tEvents(eventKey, { target: targetName, amount });
      }

      case "ARMS_EXPORT_SUMMARY":
      case "MACHINERY_EXPORT_SUMMARY": {
        const count = toDigits(Number(params["buyersCount"] || 0));
        const profit = formatCurrency(Number(params["totalProfit"] || 0));
        return tEvents(log.eventCode, { count, profit });
      }

      case "DILEMMA_RESOLVED": {
        const eventId = String(params["eventId"] || "");
        const choiceId = String(params["choiceId"] || "");

        let resolvedTitle = String(params["eventTitle"] || "");
        let resolvedChoice = String(params["choiceLabel"] || "");

        if (tDilemmas && eventId) {
          try {
            resolvedTitle = tDilemmas(`events.${eventId}.title`);
          } catch {}
        }

        if (tDilemmas && eventId && choiceId) {
          try {
            resolvedChoice = tDilemmas(
              `events.${eventId}.choices.${choiceId}.label`,
            );
          } catch {}
        }

        return tEvents("DILEMMA_RESOLVED", {
          source: sourceName,
          title: resolvedTitle,
          choice: resolvedChoice,
        });
      }

      case "GENERIC_EVENT":
      default:
        return log.message || tEvents("GENERIC_EVENT");
    }
  }
}
