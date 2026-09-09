"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { TurnLogEntry, TurnLogScope, Nation } from "@geopolitics/domain";
import {
  TurnLogRepository,
  TurnLogStatsSummary,
} from "@/infrastructure/storage/repositories/turn-log.repository";

interface UseWideReportsProps {
  logs?: TurnLogEntry[];
  currentTurn?: number;
  humanNationId?: string;
  nationsMap?: Record<string, Nation>;
  gameId?: string;
}

export function useWideReports({
  logs = [],
  currentTurn = 1,
  humanNationId,
  nationsMap,
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
      );
      setStats(freshStats);
    } catch {}
  }, [gameId, currentTurn, selectedTurn]);

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
      });

      if (pagedResult.logs.length > 0) {
        setDbLogs(pagedResult.logs);
      } else if (logs.length > 0 && selectedTurn === currentTurn) {
        setDbLogs(logs);
      } else {
        setDbLogs([]);
      }
    } catch {
      setDbLogs(logs);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, selectedTurn, selectedScope, searchQuery, logs, currentTurn]);

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
    reload: loadPagedLogs,
  };
}
