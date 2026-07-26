import React from "react";
import { Search } from "lucide-react";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  areaSqKm: number;
}

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
        <div className="relative max-w-xs w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search code or name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-900 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[550px] p-4 divide-y divide-slate-900/60 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-600 text-xs italic">
            No matching territories detected in topology.
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <span className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full flex items-center justify-center">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ISO_A3: {c.code}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="text-slate-300 font-semibold">
                  {c.id === 0
                    ? "Infinite"
                    : `${new Intl.NumberFormat("en-US").format(c.areaSqKm)} km²`}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  INDEX ID: {c.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
