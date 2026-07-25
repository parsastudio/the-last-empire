import React from "react";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";

interface MarketExchangePanelProps {
  prices: ResourceMarketPrice;
  oilInventory: number;
  steelInventory: number;
  onBuyResource: (type: "oil" | "steel", amount: number) => void;
}

export function MarketExchangePanel({
  prices,
  oilInventory,
  steelInventory,
  onBuyResource,
}: MarketExchangePanelProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Commodities Stock Exchange
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onBuyResource("oil", 10)}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left transition-all space-y-1"
        >
          <span className="text-[10px] font-mono text-slate-500 block">
            Oil ({oilInventory})
          </span>
          <span className="text-xs font-bold text-white font-mono block">
            ${prices.oil.toFixed(0)}
          </span>
        </button>
        <button
          onClick={() => onBuyResource("steel", 10)}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left transition-all space-y-1"
        >
          <span className="text-[10px] font-mono text-slate-500 block">
            Steel ({steelInventory})
          </span>
          <span className="text-xs font-bold text-white font-mono block">
            ${prices.steel.toFixed(0)}
          </span>
        </button>
      </div>
    </div>
  );
}
