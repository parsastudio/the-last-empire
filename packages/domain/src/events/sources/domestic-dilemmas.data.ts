import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const DOMESTIC_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "industrial_labor_union_unrest",
    titleFa: "اعتصاب سراسری در شهرک‌های صنعتی",
    headlineFa: "مطالبه افزایش دستمزد و توقف چرخ کارخانه‌ها",
    descriptionFa:
      "کارگران صنایع سنگین در اعتراض به شرایط معیشتی دست از کار کشیده و سوله‌ها به حالت تعلیق درآمده‌اند.",
    category: "DOMESTIC",
    urgency: "HIGH",
    choices: [
      {
        id: "approve_wage_subsidies",
        labelFa: "اعطای بسته معیشتی و توافق با اتحادیه‌ها",
        descriptionFa:
          "آرامش فوری و بازگشت کارخانه‌ها به تولید با جهش ثبات سیاسی.",
        effect: {
          treasuryGdpPercent: -0.02,
          stabilityDelta: 12,
        },
      },
      {
        id: "enforce_labor_laws",
        labelFa: "الزام قانونی به کار و مدیریت سخت‌گیرانه",
        descriptionFa: "حفظ نقدینگی خزانه با ریسک نارضایتی مدنی و افت ثبات.",
        effect: {
          stabilityDelta: -14,
          globalReputationDelta: -5,
        },
      },
    ],
  },
  {
    id: "bureaucratic_purge_demand",
    titleFa: "کشف اختلاس در دستگاه‌های اجرایی",
    headlineFa: "مطالبه افکار عمومی برای مبارزه با فساد",
    descriptionFa:
      "رسانه‌ها اسنادی از حیف‌ومیل بودجه‌های دولتی توسط مدیران ارشد استانی منتشر کرده‌اند.",
    category: "DOMESTIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "root_out_corruption",
        labelFa: "برخورد قاطع قضایی و بازگرداندن اموال",
        descriptionFa:
          "ارتقای چشمگیر امید و اعتماد ملی و جبران بخشی از ذخایر خزانه.",
        effect: {
          treasuryGdpPercent: 0.015,
          stabilityDelta: 14,
          globalReputationDelta: 6,
        },
      },
      {
        id: "silent_administrative_reform",
        labelFa: "تغییرات بی‌سروصدا بدون تضعیف ساختار",
        descriptionFa: "حفظ پیوستگی مدیریتی در ازای نارضایتی افکار عمومی.",
        effect: {
          stabilityDelta: -8,
        },
      },
    ],
  },
  {
    id: "natural_disaster_rebuilding",
    titleFa: "زلزله مهیب در استان‌های مرکزی",
    headlineFa: "تخریب زیرساخت‌ها و نیاز به بازسازی فوری",
    descriptionFa:
      "زمین‌لرزه‌ای شدید باعث آسیب به جاده‌ها، خطوط انتقال و آوارگی هزاران خانوار شده است.",
    category: "DOMESTIC",
    urgency: "CRITICAL",
    choices: [
      {
        id: "fund_reconstruction",
        labelFa: "تخصیص بودجه اضطراری بازسازی و امداد ملی",
        descriptionFa: "نجات آسیب‌دیدگان و تحکیم همبستگی ملت و دولت.",
        effect: {
          treasuryGdpPercent: -0.025,
          stabilityDelta: 10,
          globalReputationDelta: 4,
        },
      },
      {
        id: "lean_relief",
        labelFa: "استفاده از ظرفیت‌های امدادی موجود بدون بودجه تازه",
        descriptionFa:
          "حفظ موجودی خزانه در ازای اعتراض و ناامیدی مناطق بحران‌زده.",
        effect: {
          stabilityDelta: -16,
        },
      },
    ],
  },
  {
    id: "university_student_movements",
    titleFa: "تجمعات دانشجویی و نخبگان علمی",
    headlineFa: "مطالبه آزادی‌های مدنی و بودجه پژوهشی",
    descriptionFa:
      "دانشگاه‌های پایتخت صحنه تجمعات در اعتراض به کمبود امکانات آزمایشگاهی و قوانین انضباطی است.",
    category: "DOMESTIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "grant_campus_autonomy",
        labelFa: "افزایش بودجه تحقیقات و گفتگوی رو در رو",
        descriptionFa:
          "جلوگیری از فرار مغزها و رشد دانش علمی کشور با رضایت جوانان.",
        effect: {
          treasuryGdpPercent: -0.01,
          industrialLevelDelta: 0.1,
          stabilityDelta: 8,
        },
      },
      {
        id: "disperse_movements",
        labelFa: "اعمال انضباط دانشگاهی و حفظ نظم عمومی",
        descriptionFa: "برقراری نظم سریع در ازای دلسردی قشر دانشگاهی.",
        effect: {
          stabilityDelta: -9,
          globalReputationDelta: -4,
        },
      },
    ],
  },
  {
    id: "national_anthem_and_emblem_revamp",
    titleFa: "طرح بازآفرینی نمادها و جشن‌های ملی",
    headlineFa: "تقویت هویت تاریخی و همبستگی اجتماعی",
    descriptionFa:
      "شورای عالی فرهنگ پیشنهاد برگزاری مراسم‌های سراسری و بازتولید آثار فاخر تاریخی را داده است.",
    category: "DOMESTIC",
    urgency: "LOW",
    choices: [
      {
        id: "fund_cultural_gala",
        labelFa: "تأمین مالی رویدادها و تزریق شور ملی",
        descriptionFa: "رشد محسوس نشاط اجتماعی و پایداری داخلی کشور.",
        effect: {
          treasuryGdpPercent: -0.008,
          stabilityDelta: 9,
          globalReputationDelta: 3,
        },
      },
      {
        id: "austerity_culture",
        labelFa: "اولویت صرف منابع در پروژه‌های صنعتی",
        descriptionFa: "پرهیز از هزینه در امور نمادین و تمرکز بر تولید.",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
  {
    id: "provincial_autonomy_referendum_push",
    titleFa: "مطالبات استقلال بودجه‌ای در استان‌های مرزی",
    headlineFa: "درخواست سهم بیشتر از عواید گمرکات محلی",
    descriptionFa:
      "شوراهای محلی استان‌های مرزی خواستار تخصیص مستقیم درآمدهای ترانزیت به عمران بومی شده‌اند.",
    category: "DOMESTIC",
    urgency: "HIGH",
    choices: [
      {
        id: "decentralize_funds",
        labelFa: "واگذاری سهم عمران محلی و جلب وفاداری",
        descriptionFa: "تحکیم امنیت پایدار مرزها و رضایت ساکنان استانی.",
        effect: {
          treasuryGdpPercent: -0.015,
          stabilityDelta: 11,
        },
      },
      {
        id: "centralize_treasury",
        labelFa: "تأکید بر خزانه‌داری متمرکز و رد تقاضا",
        descriptionFa:
          "تداوم تمرکز منابع مالی پایتخت در ازای نارضایتی حاشیه‌نشینان.",
        effect: {
          stabilityDelta: -12,
        },
      },
    ],
  },
]);
