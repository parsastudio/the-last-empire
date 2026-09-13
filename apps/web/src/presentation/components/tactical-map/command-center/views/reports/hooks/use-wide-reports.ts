"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  TurnLogEntry,
  TurnLogScope,
  CountryRegistry,
} from "@geopolitics/domain";
import {
  TurnLogRepository,
  TurnLogStatsSummary,
} from "@/infrastructure/storage/repositories/turn-log.repository";

interface UseWideReportsProps {
  logs?: TurnLogEntry[];
  currentTurn?: number;
  humanNationId?: string;
  gameId?: string;
}

export function useWideReports({
  logs = [],
  currentTurn = 1,
  humanNationId,
  gameId = "default_game",
}: UseWideReportsProps) {
  const [selectedScope, setSelectedScope] = useState<TurnLogScope>("NATIONAL");
  const [selectedTurn, setSelectedTurn] = useState<number | "ALL">(currentTurn);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableTurns, setAvailableTurns] = useState<number[]>([currentTurn]);
  const [dbLogs, setDbLogs] = useState<TurnLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<TurnLogStatsSummary>({
    combatCount: 0,
    diplomacyCount: 0,
    espionageCount: 0,
    criticalCount: 0,
  });

  const refreshTurnsAndStats = useCallback(async () => {
    try {
      const turns = await TurnLogRepository.getAvailableTurns(gameId);
      if (turns.length > 0) {
        setAvailableTurns(turns);
      } else {
        setAvailableTurns([currentTurn]);
      }

      const freshStats = await TurnLogRepository.getStatsSummary(
        gameId,
        selectedTurn,
        humanNationId,
        selectedScope,
      );
      setStats(freshStats);
    } catch {}
  }, [gameId, currentTurn, selectedTurn, humanNationId, selectedScope]);

  const loadPagedLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const pagedResult = await TurnLogRepository.getPaginatedLogs({
        gameId,
        turn: selectedTurn,
        scope: selectedScope,
        searchQuery,
        page: 1,
        pageSize: 50,
        humanNationId,
      });

      if (pagedResult.logs.length > 0) {
        setDbLogs(pagedResult.logs);
      } else if (logs.length > 0 && selectedTurn === currentTurn) {
        const canonicalHuman = humanNationId
          ? CountryRegistry.resolveCanonicalId(humanNationId)
          : null;

        const filteredFallback = logs.filter((log) => {
          if (log.eventCode === "DILEMMA_RESOLVED") return false;
          if (selectedScope && log.scope !== selectedScope) return false;
          if (selectedScope === "NATIONAL" && canonicalHuman) {
            const src = CountryRegistry.resolveCanonicalId(log.sourceNationId);
            const trg = log.targetNationId
              ? CountryRegistry.resolveCanonicalId(log.targetNationId)
              : null;
            return src === canonicalHuman || trg === canonicalHuman;
          }
          return true;
        });

        setDbLogs(filteredFallback);
      } else {
        setDbLogs([]);
      }
    } catch {
      const canonicalHuman = humanNationId
        ? CountryRegistry.resolveCanonicalId(humanNationId)
        : null;

      const filteredFallback = logs.filter((log) => {
        if (log.eventCode === "DILEMMA_RESOLVED") return false;
        if (selectedScope && log.scope !== selectedScope) return false;
        if (selectedScope === "NATIONAL" && canonicalHuman) {
          const src = CountryRegistry.resolveCanonicalId(log.sourceNationId);
          const trg = log.targetNationId
            ? CountryRegistry.resolveCanonicalId(log.targetNationId)
            : null;
          return src === canonicalHuman || trg === canonicalHuman;
        }
        return true;
      });

      setDbLogs(filteredFallback);
    } finally {
      setIsLoading(false);
    }
  }, [
    gameId,
    selectedTurn,
    selectedScope,
    searchQuery,
    logs,
    currentTurn,
    humanNationId,
  ]);

  useEffect(() => {
    void refreshTurnsAndStats();
  }, [refreshTurnsAndStats]);

  useEffect(() => {
    void loadPagedLogs();
  }, [loadPagedLogs]);

  const sortedLogs = useMemo(() => {
    return dbLogs;
  }, [dbLogs]);

  return {
    selectedScope,
    selectedTurn,
    searchQuery,
    availableTurns,
    stats,
    sortedLogs,
    isLoading,
    setSelectedScope,
    setSelectedTurn,
    setSearchQuery,
  };
}
