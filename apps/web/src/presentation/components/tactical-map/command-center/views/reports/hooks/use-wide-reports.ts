import { useState, useMemo, useEffect } from "react";
import {
  TurnLogEntry,
  TurnLogCategory,
  TurnLogLevel,
  TurnLogScope,
} from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";

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
  const [selectedCategory, setSelectedCategory] = useState<
    TurnLogCategory | "ALL"
  >("ALL");
  const [selectedLevel, setSelectedLevel] = useState<TurnLogLevel | "ALL">(
    "ALL",
  );
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

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeTurnLogs
      .slice()
      .reverse()
      .filter((log) => {
        if (selectedScope === "GLOBAL") {
          if (selectedCategory !== "ALL" && log.category !== selectedCategory) {
            return false;
          }
          if (selectedLevel !== "ALL" && log.level !== selectedLevel) {
            return false;
          }
        }

        if (!query) {
          return true;
        }

        const sourceCanonical = CountryRegistry.resolveCanonicalId(
          log.sourceNationId,
        );
        const sourceNation = nationsMap ? nationsMap[sourceCanonical] : null;
        const sourceName = sourceNation
          ? sourceNation.name
          : log.sourceNationId;

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
  }, [
    activeTurnLogs,
    selectedScope,
    selectedCategory,
    selectedLevel,
    searchQuery,
    nationsMap,
  ]);

  return {
    selectedScope,
    selectedTurn,
    selectedCategory,
    selectedLevel,
    searchQuery,
    availableTurns,
    stats,
    filteredLogs,
    setSelectedScope,
    setSelectedTurn,
    setSelectedCategory,
    setSelectedLevel,
    setSearchQuery,
  };
}
