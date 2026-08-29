import { useState, useMemo, useEffect } from "react";
import { TurnLogEntry, TurnLogScope } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogFormatter } from "@/domain/game/log-formatter.utility";
import { Nation } from "@/domain/nation/nation.schema";

function calculateLogPriority(
  log: TurnLogEntry,
  canonicalHuman: string | null,
): number {
  const sourceCanonical = CountryRegistry.resolveCanonicalId(
    log.sourceNationId,
  );
  const targetCanonical = log.targetNationId
    ? CountryRegistry.resolveCanonicalId(log.targetNationId)
    : null;

  const isHumanInvolved =
    canonicalHuman !== null &&
    (sourceCanonical === canonicalHuman || targetCanonical === canonicalHuman);

  if (log.eventCode === "VICTORY_ACHIEVED") {
    return 0;
  }

  if (log.eventCode === "COALITION_FORMED") {
    return 1;
  }

  if (log.eventCode === "BATTLE_TACTICAL_REPORT" && isHumanInvolved) {
    return 2;
  }

  switch (log.eventCode) {
    case "NATION_ANNEXED":
    case "NATION_COLLAPSED":
      return isHumanInvolved ? 3 : 6;

    case "WAR_DECLARED":
    case "ALLIANCE_INTERVENTION":
    case "ALLIANCE_BETRAYED":
    case "COALITION_MEMBER_FALLEN":
      return isHumanInvolved ? 4 : 7;

    case "BATTLE_GLOBAL_NEWS":
      return 8;

    case "ESPIONAGE_OPERATION":
      return isHumanInvolved ? 5 : 9;

    case "TREATY_ACCEPTED":
    case "TREATY_REJECTED":
    case "DIPLOMATIC_PROPOSAL_SENT":
      return isHumanInvolved ? 6 : 10;

    case "ARMS_EXPORT_SUMMARY":
    case "FOREIGN_AID_SENT":
    case "ARMS_TRADE":
      return isHumanInvolved ? 7 : 11;

    case "GENERIC_EVENT":
    default:
      return 12;
  }
}

interface UseWideReportsProps {
  logs: TurnLogEntry[];
  currentTurn?: number;
  humanNationId?: string;
  nationsMap?: Record<string, Nation>;
}

export function useWideReports({
  logs = [],
  currentTurn = 1,
  humanNationId,
  nationsMap,
}: UseWideReportsProps) {
  const [selectedScope, setSelectedScope] = useState<TurnLogScope>("NATIONAL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const canonicalHuman = useMemo(() => {
    return humanNationId
      ? CountryRegistry.resolveCanonicalId(humanNationId)
      : null;
  }, [humanNationId]);

  const availableTurns = useMemo(() => {
    const turns = Array.from(new Set(logs.map((l) => l.turn)));
    if (turns.length === 0) return [currentTurn];
    return turns.sort((a, b) => b - a);
  }, [logs, currentTurn]);

  const defaultTurn = availableTurns[0] ?? currentTurn;
  const [selectedTurn, setSelectedTurn] = useState<number | "ALL">(defaultTurn);

  useEffect(() => {
    if (selectedTurn !== "ALL") {
      setSelectedTurn(availableTurns[0] ?? currentTurn);
    }
  }, [currentTurn]);

  useEffect(() => {
    if (availableTurns.length > 0 && selectedTurn !== "ALL") {
      if (!availableTurns.includes(selectedTurn)) {
        setSelectedTurn(availableTurns[0]!);
      }
    }
  }, [availableTurns, selectedTurn]);

  const activeTurnLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedTurn !== "ALL" && log.turn !== selectedTurn) {
        return false;
      }

      if (selectedScope === "NATIONAL") {
        if (!canonicalHuman) {
          return log.scope === "NATIONAL";
        }
        const srcCanonical = CountryRegistry.resolveCanonicalId(
          log.sourceNationId,
        );
        const trgCanonical = log.targetNationId
          ? CountryRegistry.resolveCanonicalId(log.targetNationId)
          : null;

        if (log.eventCode === "VICTORY_ACHIEVED") {
          return true;
        }

        if (log.eventCode === "COALITION_FORMED") {
          const memberIdsRaw = String(log.params?.["memberIds"] || "");
          const memberIds = memberIdsRaw.split(",").filter(Boolean);
          const isTarget = srcCanonical === canonicalHuman;
          const isMember = memberIds.includes(canonicalHuman);
          return isTarget || isMember;
        }

        if (log.eventCode === "ARMS_EXPORT_SUMMARY") {
          return srcCanonical === canonicalHuman;
        }

        if (log.eventCode === "ESPIONAGE_OPERATION") {
          const role = String(log.params?.["role"] || "ATTACKER");
          if (role === "ATTACKER") {
            return srcCanonical === canonicalHuman && log.scope === "NATIONAL";
          }
          if (role === "DEFENDER") {
            return srcCanonical === canonicalHuman && log.scope === "NATIONAL";
          }
          return false;
        }

        const isHumanInvolved =
          srcCanonical === canonicalHuman || trgCanonical === canonicalHuman;
        return isHumanInvolved && log.scope === "NATIONAL";
      }

      return (
        log.scope === "GLOBAL" ||
        log.eventCode === "COALITION_FORMED" ||
        log.eventCode === "VICTORY_ACHIEVED"
      );
    });
  }, [logs, selectedTurn, selectedScope, canonicalHuman]);

  const stats = useMemo(() => {
    let combatCount = 0;
    let diplomacyCount = 0;
    let espionageCount = 0;
    let criticalCount = 0;

    for (let i = 0; i < activeTurnLogs.length; i++) {
      const log = activeTurnLogs[i]!;
      if (log.category === "GLOBAL_WAR" || log.category === "MILITARY") {
        combatCount++;
      }
      if (log.category === "DIPLOMACY" || log.category === "GLOBAL_DIPLOMACY") {
        diplomacyCount++;
      }
      if (log.category === "ESPIONAGE") {
        espionageCount++;
      }
      if (log.level === "CRITICAL" || log.level === "COMBAT") {
        criticalCount++;
      }
    }

    return {
      combatCount,
      diplomacyCount,
      espionageCount,
      criticalCount,
    };
  }, [activeTurnLogs]);

  const sortedLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = activeTurnLogs.filter((log) => {
      if (!query) return true;

      const sourceCanonical = CountryRegistry.resolveCanonicalId(
        log.sourceNationId,
      );
      const sourceNation = nationsMap ? nationsMap[sourceCanonical] : null;
      const sourceName = sourceNation ? sourceNation.name : log.sourceNationId;

      let targetName = "";
      if (log.targetNationId) {
        const targetCanonical = CountryRegistry.resolveCanonicalId(
          log.targetNationId,
        );
        const targetNation = nationsMap ? nationsMap[targetCanonical] : null;
        targetName = targetNation ? targetNation.name : log.targetNationId;
      }

      const formatted = TurnLogFormatter.formatMessage(log, nationsMap);

      return (
        formatted.toLowerCase().includes(query) ||
        sourceName.toLowerCase().includes(query) ||
        targetName.toLowerCase().includes(query) ||
        log.sourceNationId.toLowerCase().includes(query) ||
        (log.targetNationId?.toLowerCase().includes(query) ?? false)
      );
    });

    return filtered.sort((a, b) => {
      const pA = calculateLogPriority(a, canonicalHuman);
      const pB = calculateLogPriority(b, canonicalHuman);
      if (pA !== pB) {
        return pA - pB;
      }
      return b.timestamp - a.timestamp;
    });
  }, [activeTurnLogs, searchQuery, canonicalHuman, nationsMap]);

  return {
    selectedScope,
    selectedTurn,
    searchQuery,
    availableTurns,
    stats,
    sortedLogs,
    setSelectedScope,
    setSelectedTurn,
    setSearchQuery,
  };
}
