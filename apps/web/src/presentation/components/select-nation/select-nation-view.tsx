"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { NationListSidebar } from "@/presentation/components/select-nation/nation-list-sidebar";
import { NationDetailsPanel } from "@/presentation/components/select-nation/nation-details-panel";
import { GOVERNMENT_OPTIONS } from "@/presentation/components/select-nation/government-type-selector";
import { SelectNationHeader } from "@/presentation/components/select-nation/select-nation-header";
import { useSelectNationForm } from "@/presentation/components/select-nation/hooks/use-select-nation-form";

export function SelectNationView() {
  const router = useRouter();
  const t = useTranslations("selectNation");
  const form = useSelectNationForm();

  if (!form.selectedNation) {
    return (
      <div className="w-screen h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold font-sans text-muted-foreground">
          {t("loadingNations")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden select-none">
      <SelectNationHeader onBack={() => router.push("/")} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-2.5 sm:p-4 md:p-6 grid grid-cols-12 gap-2.5 sm:gap-4 md:gap-6 overflow-hidden min-h-0">
        <div className="col-span-12 sm:col-span-5 md:col-span-4 h-full min-h-0">
          <NationListSidebar
            nations={form.allNations}
            selectedId={form.selectedNation.id}
            searchQuery={form.searchQuery}
            onSearchChange={form.setSearchQuery}
            onSelectNation={form.handleSelectNationCard}
          />
        </div>

        <div className="col-span-12 sm:col-span-7 md:col-span-8 h-full min-h-0">
          <NationDetailsPanel
            nation={form.selectedNation}
            governmentOptions={GOVERNMENT_OPTIONS}
            selectedGovernment={form.selectedGovernment}
            selectedDifficulty={form.selectedDifficulty}
            onSelectGovernment={form.setSelectedGovernment}
            onSelectDifficulty={form.setSelectedDifficulty}
            onStartCampaign={form.handleStartCampaign}
          />
        </div>
      </main>
    </div>
  );
}
