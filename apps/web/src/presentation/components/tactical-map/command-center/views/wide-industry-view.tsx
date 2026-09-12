"use client";

import React, { useState } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  IndustrySubTabsHeader,
  IndustrySubTabType,
} from "./industry/industry-sub-tabs-header";
import { IndustryDomesticTab } from "./industry/industry-domestic-tab";
import { IndustryImportTab } from "./industry/industry-import-tab";

interface WideIndustryViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  initialSubTab?: string | null;
}

export function WideIndustryView({
  nation,
  nationsMap,
  provincesMap,
  initialSubTab,
}: WideIndustryViewProps) {
  const [activeTab, setActiveTab] = useState<IndustrySubTabType>(
    initialSubTab === "imports" ? "imports" : "domestic",
  );

  return (
    <div className="space-y-6 text-start font-sans">
      <div className="flex items-center justify-between">
        <IndustrySubTabsHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </div>

      {activeTab === "domestic" ? (
        <IndustryDomesticTab nation={nation} provincesMap={provincesMap} />
      ) : (
        <IndustryImportTab
          nation={nation}
          nationsMap={nationsMap}
          provincesMap={provincesMap}
        />
      )}
    </div>
  );
}
