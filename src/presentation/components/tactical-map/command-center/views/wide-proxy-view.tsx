import React, { useState } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useWideProxy } from "./proxy/hooks/use-wide-proxy";
import { ProxyActiveOperationsSection } from "./proxy/proxy-active-operations-section";
import { ProxyAllocationSection } from "./proxy/proxy-allocation-section";

interface WideProxyViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function WideProxyView({
  nation,
  nationsMap,
  selectedTargetCode,
}: WideProxyViewProps) {
  const [activeTab, setActiveTab] = useState<"active" | "allocate">("allocate");

  const proxy = useWideProxy({
    nation,
    nationsMap,
    selectedTargetCode,
  });

  const handleSelectActiveOperationTarget = (targetId: string) => {
    proxy.setSelectedTargetId(targetId);
    setActiveTab("allocate");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="flex bg-secondary/80 border border-border p-1 rounded-2xl gap-1 shrink-0 w-max">
        <button
          onClick={() => setActiveTab("allocate")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "allocate"
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          اختصاص بودجه و راه اندازی عملیات
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          جبهه‌های فعال نیابتی ({proxy.activeOperations.length})
        </button>
      </div>

      {activeTab === "active" ? (
        <ProxyActiveOperationsSection
          operations={proxy.activeOperations}
          onSelectOperationTarget={handleSelectActiveOperationTarget}
        />
      ) : (
        <ProxyAllocationSection
          searchQuery={proxy.searchQuery}
          selectedTargetId={proxy.selectedTargetId}
          allocatedBudget={proxy.allocatedBudget}
          userTreasury={nation.treasury}
          filteredTargetOptions={proxy.filteredTargetOptions}
          selectedTargetNation={proxy.selectedTargetNation}
          predictedStabilityDrain={proxy.predictedStabilityDrain}
          onSearchChange={proxy.setSearchQuery}
          onSelectTarget={proxy.setSelectedTargetId}
          onBudgetChange={proxy.setAllocatedBudget}
          onConfirmAllocation={proxy.handleFundProxy}
        />
      )}
    </div>
  );
}
