import { useMemo, useCallback } from "react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { DEFAULT_DOCTRINES } from "@/engine/politics/doctrines-list.config";
import { ActionFactory } from "@/domain/game/action-factory";

interface UseWideResearchProps {
  unlockedDoctrines?: string[];
  nationId?: string;
}

export function useWideResearch({
  unlockedDoctrines = ["gdp-booster"],
  nationId = "NATION_118",
}: UseWideResearchProps) {
  const { dispatchAction } = useGameActions();

  const industrialDoctrines = useMemo(() => {
    return DEFAULT_DOCTRINES.filter((d) => d.branch === "INDUSTRIAL_TECH").map(
      (d) => ({
        id: d.id,
        name: d.name,
        cost: d.cost,
        unlocked: unlockedDoctrines.includes(d.id),
      }),
    );
  }, [unlockedDoctrines]);

  const asymmetricDoctrines = useMemo(() => {
    return DEFAULT_DOCTRINES.filter(
      (d) => d.branch === "ASYMMETRIC_MILITARY",
    ).map((d) => ({
      id: d.id,
      name: d.name,
      cost: d.cost,
      unlocked: unlockedDoctrines.includes(d.id),
    }));
  }, [unlockedDoctrines]);

  const diplomaticDoctrines = useMemo(() => {
    return DEFAULT_DOCTRINES.filter(
      (d) => d.branch === "DIPLOMATIC_HEGEMONY",
    ).map((d) => ({
      id: d.id,
      name: d.name,
      cost: d.cost,
      unlocked: unlockedDoctrines.includes(d.id),
    }));
  }, [unlockedDoctrines]);

  const handleUnlock = useCallback(
    async (doc: { id: string; name: string; cost: number }) => {
      const action = ActionFactory.unlockDoctrine(nationId, doc.id);
      await dispatchAction(action, `آنلاک دکترین ${doc.name} انجام شد.`);
    },
    [dispatchAction, nationId],
  );

  return {
    industrialDoctrines,
    asymmetricDoctrines,
    diplomaticDoctrines,
    handleUnlock,
  };
}
