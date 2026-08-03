import React from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useWideProxy } from "@/presentation/components/tactical-map/command-center/views/proxy/hooks/use-wide-proxy";
import { ProxyAllocationSection } from "@/presentation/components/tactical-map/command-center/views/proxy/proxy-allocation-section";

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
  const proxy = useWideProxy({
    nation,
    nationsMap,
    selectedTargetCode,
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <ProxyAllocationSection
        searchQuery={proxy.searchQuery}
        selectedTargetId={proxy.selectedTargetId}
        desiredDrain={proxy.desiredDrain}
        requiredBudget={proxy.requiredBudget}
        userTreasury={nation.treasury}
        filteredTargetOptions={proxy.filteredTargetOptions}
        selectedTargetNation={proxy.selectedTargetNation}
        onSearchChange={proxy.setSearchQuery}
        onSelectTarget={proxy.setSelectedTargetId}
        onDrainChange={proxy.setDesiredDrain}
        onConfirmAllocation={proxy.handleFundProxy}
      />
    </div>
  );
}
