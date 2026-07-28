import React from "react";

export type DoctrineBranch =
  | "INDUSTRIAL_TECH"
  | "ASYMMETRIC_MILITARY"
  | "DIPLOMATIC_HEGEMONY";

interface DoctrineBranchSelectorProps {
  activeBranch: DoctrineBranch;
  onChangeBranch: (branch: DoctrineBranch) => void;
}

export function DoctrineBranchSelector({
  activeBranch,
  onChangeBranch,
}: DoctrineBranchSelectorProps) {
  const branches: { id: DoctrineBranch; label: string }[] = [
    { id: "INDUSTRIAL_TECH", label: "صنعت و لجستیک" },
    { id: "ASYMMETRIC_MILITARY", label: "دفاع ناهمگون" },
    { id: "DIPLOMATIC_HEGEMONY", label: "هژمونی دیپلماتیک" },
  ];

  return (
    <div className="grid grid-cols-3 bg-secondary/80 border border-border p-1 rounded-2xl gap-1 shrink-0">
      {branches.map((b) => {
        const isActive = activeBranch === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onChangeBranch(b.id)}
            className={`py-2 rounded-xl text-[9px] font-bold transition-all cursor-pointer text-center ${
              isActive
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {b.label}
          </button>
        );
      })}
    </div>
  );
}
