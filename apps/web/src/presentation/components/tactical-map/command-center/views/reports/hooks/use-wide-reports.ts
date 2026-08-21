import { useState, useMemo } from "react";
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
  humanNationId?: string;
  nationsMap?: Record<string, Nation>;
}

export function useWideReports({
  logs = [],
  humanNationId,
  nationsMap,
}: UseWideReportsProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedScope, setSelectedScope] = useState<TurnLogScope | "ALL">(
    "ALL",
  );
  const [selectedCategory, setSelectedCategory] = useState<
    TurnLogCategory | "ALL"
  >("ALL");
  const [selectedLevel, setSelectedLevel] = useState<TurnLogLevel | "ALL">(
    "ALL",
  );
  const [selectedTurn, setSelectedTurn] = useState<number | "ALL">("ALL");

  const availableTurns = useMemo(() => {
    const turns = Array.from(new Set(logs.map((l) => l.turn)));
    return turns.sort((a, b) => b - a);
  }, [logs]);

  const stats = useMemo(() => {
    let combatCount = 0;
    let diplomacyCount = 0;
    let espionageCount = 0;
    let criticalCount = 0;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i]!;
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
      total: logs.length,
      combatCount,
      diplomacyCount,
      espionageCount,
      criticalCount,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return logs
      .slice()
      .reverse()
      .filter((log) => {
        if (selectedScope !== "ALL" && log.scope !== selectedScope) {
          return false;
        }

        if (selectedCategory !== "ALL" && log.category !== selectedCategory) {
          return false;
        }

        if (selectedLevel !== "ALL" && log.level !== selectedLevel) {
          return false;
        }

        if (selectedTurn !== "ALL" && log.turn !== selectedTurn) {
          return false;
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
    logs,
    selectedScope,
    selectedCategory,
    selectedLevel,
    selectedTurn,
    searchQuery,
    nationsMap,
  ]);

  return {
    searchQuery,
    selectedScope,
    selectedCategory,
    selectedLevel,
    selectedTurn,
    availableTurns,
    stats,
    filteredLogs,
    setSearchQuery,
    setSelectedScope,
    setSelectedCategory,
    setSelectedLevel,
    setSelectedTurn,
  };
}
