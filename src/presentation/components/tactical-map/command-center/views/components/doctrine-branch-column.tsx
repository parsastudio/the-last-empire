import React from "react";
import { CheckCircle } from "lucide-react";

interface DoctrineItem {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
}

interface DoctrineBranchColumnProps {
  title: string;
  doctrines: DoctrineItem[];
  onUnlock: (doctrine: DoctrineItem) => void;
}

export function DoctrineBranchColumn({
  title,
  doctrines,
  onUnlock,
}: DoctrineBranchColumnProps) {
  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
      <div className="pb-2 border-b border-border/40 text-right">
        <h3 className="text-xs font-bold text-foreground font-sans">{title}</h3>
      </div>

      <div className="space-y-2">
        {doctrines.map((doc) => (
          <div
            key={doc.id}
            className="bg-secondary/40 border border-border/40 p-3 rounded-xl flex items-center justify-between gap-2"
          >
            <div className="space-y-0.5 text-right">
              <span className="text-[11px] font-bold text-foreground block">
                {doc.name}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground block">
                هزینه: {doc.cost} امتیاز
              </span>
            </div>

            {doc.unlocked ? (
              <span className="flex items-center gap-1 text-[9px] font-bold text-gdp">
                <CheckCircle size={12} />
                <span>فعال</span>
              </span>
            ) : (
              <button
                onClick={() => onUnlock(doc)}
                className="px-2.5 py-1 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-lg text-[9px] font-bold cursor-pointer"
              >
                آنلاک
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
