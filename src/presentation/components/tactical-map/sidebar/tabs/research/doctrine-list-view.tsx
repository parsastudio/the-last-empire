import React from "react";
import { CheckCircle } from "lucide-react";

interface DoctrineItem {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
}

interface DoctrineListViewProps {
  doctrines: DoctrineItem[];
}

export function DoctrineListView({ doctrines }: DoctrineListViewProps) {
  return (
    <div className="space-y-2">
      {doctrines.map((doc) => (
        <div
          key={doc.id}
          className="bg-background/40 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between gap-3"
        >
          <div className="space-y-1 text-right">
            <span className="text-xs font-bold text-foreground block">
              {doc.name}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground block">
              هزینه: {doc.cost} امتیاز دکترین
            </span>
          </div>
          {doc.unlocked ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-gdp">
              <CheckCircle size={13} />
              <span>باز شده</span>
            </span>
          ) : (
            <button
              onClick={() => alert(`آنلاک دکترین ${doc.name}`)}
              className="px-3 py-1.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-[10px] font-bold shadow-sm cursor-pointer"
            >
              باز کردن
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
