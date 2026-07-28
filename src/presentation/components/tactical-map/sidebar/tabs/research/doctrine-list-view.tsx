import React from "react";
import { DoctrineItem } from "./doctrines.config";
import { DoctrineItemCard } from "./doctrine-item-card";

interface DoctrineListViewProps {
  doctrines: DoctrineItem[];
}

export function DoctrineListView({ doctrines }: DoctrineListViewProps) {
  const handleUnlock = (doctrine: DoctrineItem) => {
    alert(`آنلاک دکترین ${doctrine.name}`);
  };

  return (
    <div className="space-y-2">
      {doctrines.map((doc) => (
        <DoctrineItemCard key={doc.id} doctrine={doc} onUnlock={handleUnlock} />
      ))}
    </div>
  );
}
