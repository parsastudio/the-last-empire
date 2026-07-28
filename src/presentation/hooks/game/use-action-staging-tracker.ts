import { useState, useCallback } from "react";

export interface StagedActionItem {
  id: string;
  typeLabel: string;
  cost: number;
}

export function useActionStagingTracker() {
  const [stagedActions, setStagedActions] = useState<StagedActionItem[]>([]);

  const addStagedAction = useCallback((typeLabel: string, cost: number) => {
    const item: StagedActionItem = {
      id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      typeLabel,
      cost,
    };
    setStagedActions((prev) => [item, ...prev]);
  }, []);

  const clearStagedActions = useCallback(() => {
    setStagedActions([]);
  }, []);

  return {
    stagedActions,
    addStagedAction,
    clearStagedActions,
    setStagedActions,
  };
}
