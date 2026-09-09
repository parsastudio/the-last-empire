"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NationListSidebar } from "@/presentation/components/select-nation/nation-list-sidebar";
import { NationDetailsPanel } from "@/presentation/components/select-nation/nation-details-panel";
import { GOVERNMENT_OPTIONS } from "@/presentation/components/select-nation/government-type-selector";
import { SelectNationHeader } from "@/presentation/components/select-nation/select-nation-header";
import { useSelectNationForm } from "@/presentation/components/select-nation/hooks/use-select-nation-form";

export default function SelectNationPage() {
  const router = useRouter();
  const form = useSelectNationForm();

  if (!form.selectedNation) {
    return (
      <div className="w-screen h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 dir-rtl">
        <div className="w-10 h-10 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold font-sans text-muted-foreground">
          در حال بارگذاری اطلاعات کشورها...
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden select-none dir-rtl"
      dir="rtl"
    >
      <SelectNationHeader onBack={() => router.push("/")} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <NationListSidebar
          nations={form.allNations}
          selectedId={form.selectedNation.id}
          searchQuery={form.searchQuery}
          onSearchChange={form.setSearchQuery}
          onSelectNation={form.handleSelectNationCard}
        />

        <NationDetailsPanel
          nation={form.selectedNation}
          governmentOptions={GOVERNMENT_OPTIONS}
          selectedGovernment={form.selectedGovernment}
          selectedDifficulty={form.selectedDifficulty}
          onSelectGovernment={form.setSelectedGovernment}
          onSelectDifficulty={form.setSelectedDifficulty}
          onStartCampaign={form.handleStartCampaign}
        />
      </main>
    </div>
  );
}
