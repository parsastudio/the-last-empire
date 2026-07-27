import React, { useState } from "react";
import {
  DiplomaticRelation,
  DiplomacyDetailView,
} from "./diplomacy/diplomacy-detail-view";
import { DiplomacyListView } from "./diplomacy/diplomacy-list-view";

const MOCK_DIPLOMATIC_RELATIONS: DiplomaticRelation[] = [
  {
    code: "USA",
    name: "ایالات متحده آمریکا",
    stance: "WAR",
    opinion: -75,
    description: "تنش راهبردی شدید و تحریم‌های همه‌جانبه مالی.",
  },
  {
    code: "CHN",
    name: "چین",
    stance: "ALLIANCE",
    opinion: 85,
    description: "پیمان مشارکت راهبردی و همکاری‌های تجاری انرژی.",
  },
  {
    code: "RUS",
    name: "روسیه",
    stance: "NON_AGGRESSION_PACT",
    opinion: 60,
    description: "پیمان عدم تخاصم و توافقات ترانزیت امنیتی.",
  },
  {
    code: "DEU",
    name: "آلمان",
    stance: "PEACE",
    opinion: 10,
    description: "روابط دیپلماتیک عادی و سرد بدون تعهد خاص.",
  },
];

export function DiplomacyTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelation, setSelectedRelation] =
    useState<DiplomaticRelation | null>(null);

  if (selectedRelation) {
    return (
      <DiplomacyDetailView
        relation={selectedRelation}
        onBack={() => setSelectedRelation(null)}
      />
    );
  }

  return (
    <DiplomacyListView
      relations={MOCK_DIPLOMATIC_RELATIONS}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectRelation={setSelectedRelation}
    />
  );
}
