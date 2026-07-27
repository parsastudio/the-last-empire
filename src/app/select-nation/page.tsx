"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { NationListSidebar } from "@/presentation/components/select-nation/nation-list-sidebar";
import { NationDetailsPanel } from "@/presentation/components/select-nation/nation-details-panel";
import { GovernmentOption } from "@/presentation/components/select-nation/government-type-selector";

const NATIONS_DATABASE: NationDetail[] = [
  {
    id: "USA",
    name: "ایالات متحده آمریکا",
    code: "us",
    rank: 1,
    power: "ابرقدرت جهانی",
    gdp: "۲۶.۸ تریلیون دلار",
    population: "۳۳۵ میلیون نفر",
    treasury: "$1,000,000",
    desc: "بزرگترین اقتصاد دنیا، فناوری پیشرفته دفاعی و چتر امنیتی جهانی با زیرساخت‌های صنعتی پیشرفته.",
    defaultGovernment: "DEMOCRACY",
  },
  {
    id: "CHN",
    name: "چین",
    code: "cn",
    rank: 2,
    power: "پیشران صنعتی و تجاری",
    gdp: "۱۸.۰ تریلیون دلار",
    population: "۱.۴ میلیارد نفر",
    treasury: "$900,000",
    desc: "قطب عظیم تولید صنعتی جهان، نیروی انسانی عظیم و توانمندی‌های گسترده لجستیکی.",
    defaultGovernment: "COMMUNISM",
  },
  {
    id: "RUS",
    name: "روسیه",
    code: "ru",
    rank: 3,
    power: "قطب بزرگ نظامی",
    gdp: "۱.۷ تریلیون دلار",
    population: "۱۴۴ میلیون نفر",
    treasury: "$500,000",
    desc: "بزرگترین پهنه سرزمینی جهان، صنایع سنگین تسلیحاتی و منابع سرشار نفت و گاز.",
    defaultGovernment: "DICTATORSHIP",
  },
  {
    id: "IRN",
    name: "ایران",
    code: "ir",
    rank: 14,
    power: "قدرت فرامنطقه‌ای",
    gdp: "۴۵۰ میلیارد دلار",
    population: "۸۸ میلیون نفر",
    treasury: "$350,000",
    desc: "ذخایر استراتژیک هیدروکربن، موقعیت ژئوپلیتیک بی‌بدیل در خاورمیانه و توان موشکی بازدارنده.",
    defaultGovernment: "DICTATORSHIP",
  },
  {
    id: "DEU",
    name: "آلمان",
    code: "de",
    rank: 4,
    power: "اقتصاد برتر قاره‌ای",
    gdp: "۴.۳ تریلیون دلار",
    population: "۸۴ میلیون نفر",
    treasury: "$750,000",
    desc: "صنایع فوق‌پیشرفته مهندسی، ثبات عمیق مالی و نفوذ دیپلماتیک ساختاری در اتحادیه اروپا.",
    defaultGovernment: "DEMOCRACY",
  },
];

const GOVERNMENT_OPTIONS: GovernmentOption[] = [
  {
    type: "DEMOCRACY",
    name: "دموکراسی",
    desc: "باعث رشد اقتصادی سریع‌تر و پاداش دیپلماتیک می‌شود، اما در برابر جنگ‌افروزی و فرسایش بحران آسیب‌پذیرتر است.",
  },
  {
    type: "DICTATORSHIP",
    name: "حکومت دیکتاتوری",
    desc: "قدرت متمرکز و پایداری نظامی بالا، اما با هزینه بالای فساد ساختاری و نارضایتی شدید مردمی همراه است.",
  },
  {
    type: "MONARCHY",
    name: "پادشاهی",
    desc: "ثبات سنتی بالا، مشروعیت بالا و هزینه‌های بهینه فرمانروایی با انعطاف‌پذیری متوسط در برابر بحران‌ها.",
  },
  {
    type: "COMMUNISM",
    name: "کمونیسم",
    desc: "بسیج عمومی بالا برای صنایع و ارتش، کاهش هزینه‌های نگهداری ادوات جنگی و تمرکز شدید دولتی.",
  },
  {
    type: "FASCISM",
    name: "فاشیسم",
    desc: "قدرت مرگبار تهاجمی و پاداش فوق‌العاده در نبردها، در عوض انزوای جهانی و فرسایش شدید ساختاری.",
  },
];

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
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowRight size={15} />
            <span>بازگشت به منوی اصلی</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-gdp">
            انتخاب حاکمیت و ساختار سیاسی
          </span>
        </div>
      </header>

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
