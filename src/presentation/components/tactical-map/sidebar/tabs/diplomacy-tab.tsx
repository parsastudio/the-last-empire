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
    description: "بزرگترین اقتصاد جهان با شبکه دفاعی فراقاره‌ای.",
    profileData: {
      gdp: "$۲۶.۸ تریلیون دلار",
      population: "۳۳۵ میلیون نفر",
      militaryStrength: "۱۳۳۵ یگان",
      infantry: "۱,۰۰۰ یگان",
      airForce: "۲۵۰ فروند",
      droneMissile: "۸۰ یگان",
      techLevel: 5,
      governmentType: "دموکراسی",
      stability: 80,
      corruption: 5,
    },
  },
  {
    code: "CHN",
    name: "چین",
    stance: "ALLIANCE",
    opinion: 85,
    description: "پیشران صنعتی جهان با زنجیره تامین گسترده.",
    profileData: {
      gdp: "$۱۸.۰ تریلیون دلار",
      population: "۱.۴ میلیارد نفر",
      militaryStrength: "۱۴۶۰ یگان",
      infantry: "۱,۲۰۰ یگان",
      airForce: "۲۰۰ فروند",
      droneMissile: "۷۰ یگان",
      techLevel: 4,
      governmentType: "کمونیسم",
      stability: 85,
      corruption: 15,
    },
  },
  {
    code: "ISR",
    name: "اسرائیل",
    stance: "PEACE",
    opinion: -60,
    description: "قدرت تکنولوژیک با ارتش پیشرفته و پدافند چندلایه.",
    profileData: {
      gdp: "$۵۰۰ میلیارد دلار",
      population: "۹.۵ میلیون نفر",
      militaryStrength: "۳۱۰ یگان",
      infantry: "۲۰۰ یگان",
      airForce: "۷۵ فروند",
      droneMissile: "۳۵ یگان",
      techLevel: 5,
      governmentType: "دموکراسی",
      stability: 85,
      corruption: 10,
    },
  },
  {
    code: "RUS",
    name: "روسیه",
    stance: "NON_AGGRESSION_PACT",
    opinion: 60,
    description: "دارنده پهنه سرزمینی عظیم و صنایع سنگین نظامی.",
    profileData: {
      gdp: "$۱.۷ تریلیون دلار",
      population: "۱۴۴ میلیون نفر",
      militaryStrength: "۱۰۱۰ یگان",
      infantry: "۸۰۰ یگان",
      airForce: "۱۵۰ فروند",
      droneMissile: "۶۰ یگان",
      techLevel: 4,
      governmentType: "حکومت دیکتاتوری",
      stability: 70,
      corruption: 30,
    },
  },
  {
    code: "DEU",
    name: "آلمان",
    stance: "PEACE",
    opinion: 10,
    description: "قطب صنعتی اروپا با ثبات مالی عمیق.",
    profileData: {
      gdp: "$۴.۳ تریلیون دلار",
      population: "۸۴ میلیون نفر",
      militaryStrength: "۲۲۰ یگان",
      infantry: "۱۵۰ یگان",
      airForce: "۵۵ فروند",
      droneMissile: "۱۵ یگان",
      techLevel: 4,
      governmentType: "دموکراسی",
      stability: 90,
      corruption: 5,
    },
  },
];

interface DiplomacyTabProps {
  selectedTargetCode?: string | null;
}

export function DiplomacyTab({ selectedTargetCode }: DiplomacyTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelation, setSelectedRelation] =
    useState<DiplomaticRelation | null>(null);
  const [prevTargetCode, setPrevTargetCode] = useState<string | null>(null);

  if (selectedTargetCode && selectedTargetCode !== prevTargetCode) {
    setPrevTargetCode(selectedTargetCode);
    const found = MOCK_DIPLOMATIC_RELATIONS.find(
      (r) => r.code.toUpperCase() === selectedTargetCode.toUpperCase(),
    );
    if (found) {
      setSelectedRelation(found);
    } else {
      setSelectedRelation({
        code: selectedTargetCode.toUpperCase(),
        name: `کشور ${selectedTargetCode}`,
        stance: "PEACE",
        opinion: 0,
        description: "شناسنامه رسمی حاکمیت و اطلاعات استراتژیک.",
        profileData: {
          gdp: "$۵۰ میلیارد دلار",
          population: "۱۰ میلیون نفر",
          militaryStrength: "۱۰۰ یگان",
          infantry: "۶۰ یگان",
          airForce: "۳۰ فروند",
          droneMissile: "۱۰ یگان",
          techLevel: 2,
          governmentType: "دموکراسی",
          stability: 75,
          corruption: 15,
        },
      });
    }
  }

  if (selectedRelation) {
    return (
      <DiplomacyDetailView
        relation={selectedRelation}
        onBack={() => {
          setSelectedRelation(null);
          setPrevTargetCode(null);
        }}
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
