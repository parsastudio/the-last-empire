import { useState, useMemo, useEffect } from "react";
import { TurnLogEntry, TurnLogScope } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
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

  if (
    log.category === "GLOBAL_ANNEXATION" ||
    log.message.includes("سقوط") ||
    log.message.includes("انحلال")
  ) {
    return isHumanInvolved ? 1 : 4;
  }

  if (
    log.level === "CRITICAL" ||
    log.level === "COMBAT" ||
    log.category === "GLOBAL_WAR" ||
    log.category === "MILITARY"
  ) {
    if (
      log.message.includes("اعلان جنگ") ||
      log.message.includes("تهاجم") ||
      log.message.includes("حمله")
    ) {
      return isHumanInvolved ? 2 : 5;
    }
    if (log.message.includes("پیمان‌شکنی") || log.message.includes("خیانت")) {
      return isHumanInvolved ? 2 : 6;
    }
    return isHumanInvolved ? 3 : 7;
  }

  if (log.category === "ESPIONAGE") {
    return isHumanInvolved ? 4 : 8;
  }

  if (log.category === "DIPLOMACY" || log.category === "GLOBAL_DIPLOMACY") {
    if (log.level === "WARNING") return isHumanInvolved ? 5 : 9;
    return isHumanInvolved ? 6 : 10;
  }

  if (log.message.includes("کمک مالی") || log.category === "DOMESTIC") {
    return isHumanInvolved ? 7 : 11;
  }

  return 12;
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
  const [selectedTurn, setSelectedTurn] = useState<number | "ALL">(currentTurn);
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

  useEffect(() => {
    if (availableTurns.length > 0 && selectedTurn !== "ALL") {
      const latestAvailable = availableTurns[0]!;
      if (!availableTurns.includes(selectedTurn)) {
        setSelectedTurn(latestAvailable);
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

        const isHumanInvolved =
          srcCanonical === canonicalHuman || trgCanonical === canonicalHuman;
        return isHumanInvolved && log.scope === "NATIONAL";
      }

      return log.scope === "GLOBAL";
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

      return (
        log.message.toLowerCase().includes(query) ||
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
