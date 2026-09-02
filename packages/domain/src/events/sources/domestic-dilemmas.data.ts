import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const DOMESTIC_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "factory_workers_strike",
    titleFa: "اعتصاب سراسری اتحادیه کارخانجات صنعتی",
    headlineFa: "فلج شدن خطوط تولید و اعتراض کارگران",
    descriptionFa:
      "اتحادیه کارگران صنایع سنگین در اعتراض به دستمزدها دست از کار کشیده‌اند. بازدهی کارخانه‌ها متوقف شده و خیابان‌های صنعتی ناآرام است.",
    category: "DOMESTIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "pay_subsidies",
        labelFa: "پرداخت بسته حمایتی و افزایش دستمزد",
        descriptionFa:
          "تأمین معیشت کارگران از محل خزانه ملی برای بازگشت فوری آرامش و ارتقای رضایت عمومی.",
        effect: {
          treasuryDelta: -12_000_000_000,
          stabilityDelta: 10,
        },
      },
      {
        id: "crackdown_security",
        labelFa: "انضباط امنیتی و بازگشایی اجباری سوله‌ها",
        descriptionFa:
          "حفظ سرمایه خزانه با سرکوب اعتصابات در ازای افت شدید شاخص ثبات سیاسی داخلی.",
        effect: {
          treasuryDelta: 0,
          stabilityDelta: -14,
          globalReputationDelta: -6,
        },
      },
    ],
  },
  {
    id: "military_corruption_scandal",
    titleFa: "افشای فساد مالی در ستاد تدارکات ارتش",
    headlineFa: "اختلاس در بودجه‌های لجستیک و خرید جنگ‌افزار",
    descriptionFa:
      "بازرسی ویژه حاکمیت کشف کرده که بخشی از بودجه‌های نظامی به جیب ژنرال‌های ارشد رفته و آمادگی برخی پادگان‌ها صوری گزارش شده است.",
    category: "DOMESTIC",
    urgency: "HIGH",
    choices: [
      {
        id: "purge_and_reform",
        labelFa: "پاکسازی قاطع فرماندهان و محاکمه علنی",
        descriptionFa:
          "ارتقای چشمگیر اعتماد و ثبات مردم در ازای افت موقت کارایی و انضباط پادگان‌ها.",
        effect: {
          stabilityDelta: 15,
          infantryDelta: -15,
          globalReputationDelta: 5,
        },
      },
      {
        id: "coverup_quietly",
        labelFa: "سرپوش گذاشتن و جریمه اداری محرمانه",
        descriptionFa:
          "بازپس‌گیری بخشی از اموال اختلاس‌شده به خزانه بدون تضعیف ساختار فرماندهی ارتش.",
        effect: {
          treasuryDelta: 10_000_000_000,
          stabilityDelta: -8,
        },
      },
    ],
  },
]);
