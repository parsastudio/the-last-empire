"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { NationListSidebar } from "@/presentation/components/select-nation/nation-list-sidebar";
import { NationDetailsPanel } from "@/presentation/components/select-nation/nation-details-panel";
import { NATIONS_DATABASE } from "@/presentation/components/select-nation/config/nations-database.config";
import { GOVERNMENT_OPTIONS } from "@/presentation/components/select-nation/config/government-options.config";
import { SelectNationHeader } from "@/presentation/components/select-nation/select-nation-header";

export default function SelectNationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNation, setSelectedNation] = useState<NationDetail>(
    NATIONS_DATABASE[0]!,
  );
  const [selectedGovernment, setSelectedGovernment] = useState<string>(
    NATIONS_DATABASE[0]!.defaultGovernment,
  );

  const handleSelectNationCard = (nation: NationDetail) => {
    setSelectedNation(nation);
    setSelectedGovernment(nation.defaultGovernment);
  };

  const handleStartCampaign = async () => {
    try {
      const res = await fetch("/api/game/select-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nationId: selectedNation.id,
          governmentType: selectedGovernment,
        }),
      });
      if (res.ok) {
        router.push("/play");
      }
    } catch {
      alert("خطا در راه‌اندازی کمپین بازی");
    }
  };

  return (
    <div
      className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden select-none"
      dir="rtl"
    >
      <SelectNationHeader onBack={() => router.push("/")} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <NationListSidebar
          nations={NATIONS_DATABASE}
          selectedId={selectedNation.id}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectNation={handleSelectNationCard}
        />

        <NationDetailsPanel
          nation={selectedNation}
          governmentOptions={GOVERNMENT_OPTIONS}
          selectedGovernment={selectedGovernment}
          onSelectGovernment={setSelectedGovernment}
          onStartCampaign={handleStartCampaign}
        />
      </main>
    </div>
  );
}
