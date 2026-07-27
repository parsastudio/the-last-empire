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
    intelData: {
      gdp: "۲۶.۸ تریلیون دلار",
      population: "۳۳۵ میلیون نفر",
      militaryStrength: "۱۳۳۵ یگان",
      techLevel: 5,
      stabilityDesc: "پایدار با چالش‌های داخلی متمرکز.",
    },
  },
  {
    code: "CHN",
    name: "چین",
    stance: "ALLIANCE",
    opinion: 85,
    description: "پیمان مشارکت راهبردی و همکاری‌های تجاری انرژی.",
    intelData: {
      gdp: "۱۸.۰ تریلیون دلار",
      population: "۱.۴ میلیارد نفر",
      militaryStrength: "۱۴۶۰ یگان",
      techLevel: 4,
      stabilityDesc: "ثبات سیاسی بالا و کنترل متمرکز.",
    },
  },
  {
    code: "RUS",
    name: "روسیه",
    stance: "NON_AGGRESSION_PACT",
    opinion: 60,
    description: "پیمان عدم تخاصم و توافقات ترانزیت امنیتی.",
    intelData: {
      gdp: "۱.۷ تریلیون دلار",
      population: "۱۴۴ میلیون نفر",
      militaryStrength: "۱۰۱۰ یگان",
      techLevel: 4,
      stabilityDesc: "پایداری متوسط تحت فشار تحریم.",
    },
  },
  {
    code: "DEU",
    name: "آلمان",
    stance: "PEACE",
    opinion: 10,
    description: "روابط دیپلماتیک عادی و سرد بدون تعهد خاص.",
    intelData: {
      gdp: "۴.۳ تریلیون دلار",
      population: "۸۴ میلیون نفر",
      militaryStrength: "۲۴۰ یگان",
      techLevel: 4,
      stabilityDesc: "ثبات ساختاری عالی و اقتصاد پویا.",
    },
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
