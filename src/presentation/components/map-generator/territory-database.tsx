import React from "react";
import { TerritoryRow, CountryMapping } from "./territory-row";
import { TerritorySearchInput } from "./territory-search-input";

interface TerritoryDatabaseProps {
  countries: CountryMapping[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TerritoryDatabase({
  countries,
  searchQuery,
  onSearchChange,
}: TerritoryDatabaseProps) {
  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="lg:col-span-2 flex flex-col bg-slate-900/20 border border-slate-900 rounded-3xl overflow-hidden min-h-[500px]">
      <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/30">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            Sovereign Territory Database
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Real-time Cosine Weighted Projections
          </p>
        </div>
        <TerritorySearchInput value={searchQuery} onChange={onSearchChange} />
      </div>

      <div className="flex-1 overflow-y-auto max-h-[550px] p-4 divide-y divide-slate-900/60 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-600 text-xs italic">
            No matching territories detected in topology.
          </div>
        ) : (
          filtered.map((c) => <TerritoryRow key={c.id} country={c} />)
        )}
      </div>
    </div>
  );
}
