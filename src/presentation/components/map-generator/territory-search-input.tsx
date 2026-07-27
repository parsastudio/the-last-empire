import React from "react";
import { Search } from "lucide-react";

interface TerritorySearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TerritorySearchInput({
  value,
  onChange,
}: TerritorySearchInputProps) {
  return (
    <div className="relative max-w-xs w-full">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        size={14}
      />
      <input
        type="text"
        placeholder="Search code or name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-900 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
      />
    </div>
  );
}
