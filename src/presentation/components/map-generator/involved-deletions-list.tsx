import React from "react";

interface InvolvedDeletionsListProps {
  deletions: string[];
}

export function InvolvedDeletionsList({
  deletions,
}: InvolvedDeletionsListProps) {
  return (
    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-2">
      <div className="text-[10px] text-slate-500 uppercase font-bold">
        Involved Deletions:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {deletions.map((code) => (
          <span
            key={code}
            className="px-2 py-0.5 bg-rose-950/30 border border-rose-900/20 rounded-md text-rose-400 text-[10px]"
          >
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}
