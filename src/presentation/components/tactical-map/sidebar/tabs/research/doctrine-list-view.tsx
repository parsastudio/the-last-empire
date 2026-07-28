import React from "react";
import { DoctrineItemCard } from "./doctrine-item-card";
import { PRESENTATION_DOCTRINES } from "./doctrines.config";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";

interface DoctrineListViewProps {
  unlockedDoctrines?: string[];
  nationId?: string;
}

export function DoctrineListView({
  unlockedDoctrines = [],
  nationId = "NATION_118",
}: DoctrineListViewProps) {
  const { dispatchAction } = useGameActions();

  const handleUnlock = async (doc: { id: string; name: string }) => {
    await dispatchAction(
      {
        id: `unlock-${Date.now()}`,
        nationId,
        type: "UNLOCK_DOCTRINE",
        doctrineId: doc.id,
      },
      `آنلاک دکترین ${doc.name} با موفقیت انجام شد.`,
    );
  };

  return (
    <div className="space-y-2 dir-rtl text-right">
      {PRESENTATION_DOCTRINES.map((doc) => (
        <DoctrineItemCard
          key={doc.id}
          doctrine={{
            id: doc.id,
            name: doc.name,
            cost: doc.cost,
            unlocked: unlockedDoctrines.includes(doc.id),
          }}
          onUnlock={handleUnlock}
        />
      ))}
    </div>
  );
}
