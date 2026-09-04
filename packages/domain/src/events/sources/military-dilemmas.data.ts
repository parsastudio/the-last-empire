import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const MILITARY_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "covert_arms_offer",
    titleFa: "پیشنهاد فروش مازاد ادوات به متحدین",
    headlineFa: "نقدینگی فوری در ازای بخشی از تجهیزات",
    descriptionFa:
      "یک دولت هم‌پیمان خواستار خرید فوری تعدادی از تانک‌های رزمی ارتش شما به نرخ بالا شده است.",
    category: "MILITARY",
    urgency: "MEDIUM",
    choices: [
      {
        id: "sell_tanks_batch",
        labelFa: "واگذاری ادوات و دریافت وجه نقد",
        descriptionFa: "شارژ اساسی خزانه در ازای کاهش مختصر استعداد زرهی.",
        effect: {
          treasuryGdpPercent: 0.035,
          armorDelta: -8,
        },
      },
      {
        id: "keep_readiness",
        labelFa: "حفظ کامل توان تسلیحاتی در یگان‌ها",
        descriptionFa: "تثبیت بازدارندگی رزمی بدون کاهش ناوگان زرهی.",
        effect: {
          stabilityDelta: 3,
        },
      },
    ],
  },
  {
    id: "strait_security_incident",
    titleFa: "تهدید امنیت در گذرگاه دریایی",
    headlineFa: "مزاحمت برای نفتکش‌ها در آبراه ترانزیتی",
    descriptionFa:
      "قایق‌های متخاصم تردد کشتی‌های بازرگانی در آبراه‌های نزدیک را مختل کرده‌اند.",
    category: "MILITARY",
    urgency: "CRITICAL",
    choices: [
      {
        id: "dispatch_naval_taskforce",
        labelFa: "اعزام فوری ناوگان و برقراری گشت اسکورت",
        descriptionFa:
          "تثبیت اقتدار دریایی و کسب اعتبار در ازای مخارج لجستیکی.",
        effect: {
          treasuryGdpPercent: -0.015,
          globalReputationDelta: 10,
          stabilityDelta: 4,
        },
      },
      {
        id: "pass_incident",
        labelFa: "عدم مداخله نظامی مستقیم",
        descriptionFa:
          "صرفه‌جویی در سوخت و مخارج در ازای لطمه به پرستیژ بین‌المللی.",
        effect: {
          globalReputationDelta: -12,
          stabilityDelta: -5,
        },
      },
    ],
  },
  {
    id: "national_conscription_surge",
    titleFa: "موج داوطلبان خدمت نظام",
    headlineFa: "تقاضای بالای جوانان برای پیوستن به ارتش",
    descriptionFa:
      "شور میهن‌پرستی در کشور بالا گرفته و صف‌های طولانی در مراکز سربازگیری تشکیل شده است.",
    category: "MILITARY",
    urgency: "MEDIUM",
    choices: [
      {
        id: "expand_divisions",
        labelFa: "پذیرش سراسری و تجهیز لشکرهای جدید",
        descriptionFa:
          "افزایش محسوس یگان‌های پیاده در ازای هزینه تجهیز پادگان‌ها.",
        effect: {
          treasuryGdpPercent: -0.02,
          infantryDelta: 35,
          stabilityDelta: 6,
        },
      },
      {
        id: "selective_intake",
        labelFa: "پذیرش محدود نخبگان با بودجه عادی",
        descriptionFa:
          "حفظ توازن مخارج و ارتقای انضباط پادگان‌ها بدون هزینه اضافی.",
        effect: {
          infantryDelta: 10,
          stabilityDelta: 2,
        },
      },
    ],
  },
  {
    id: "ammunition_plant_modernization",
    titleFa: "نوسازی صنایع مهمات و راکت‌سازی",
    headlineFa: "افزایش ذخایر موشک‌های نقطه‌زن",
    descriptionFa:
      "ستاد کل نیروهای مسلح طرحی برای دوبرابر کردن تیراژ تولید موشک و پهپاد ارائه کرده است.",
    category: "MILITARY",
    urgency: "HIGH",
    choices: [
      {
        id: "fund_missile_expansion",
        labelFa: "تأمین بودجه توسعه خطوط راکت‌سازی",
        descriptionFa: "تولید انبوه پهپاد و موشک انتحاری جهت برتری در جنگ.",
        effect: {
          treasuryGdpPercent: -0.025,
          droneMissileDelta: 25,
        },
      },
      {
        id: "maintain_current_pace",
        labelFa: "ادامه تولید در چارچوب ظرفیت‌های جاری",
        descriptionFa: "پرهیز از تحمیل هزینه به خزانه و حفظ ذخایر ریالی.",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
  {
    id: "veterans_welfare_bill",
    titleFa: "لایحه مستمری و رفاه کهنه‌سربازان",
    headlineFa: "مطالبات صنفی ایثارگران و بازنشستگان ارتش",
    descriptionFa:
      "نمایندگان نظامیان خواستار بهبود بسته‌های درمانی و مستمری کادرهای رزمی شده‌اند.",
    category: "MILITARY",
    urgency: "LOW",
    choices: [
      {
        id: "approve_pension",
        labelFa: "تصویب لایحه و پرداخت کمک‌معیشتی",
        descriptionFa: "ارتقای چشمگیر انگیزه و ثبات نیروهای مسلح در کشور.",
        effect: {
          treasuryGdpPercent: -0.01,
          stabilityDelta: 8,
        },
      },
      {
        id: "defer_welfare",
        labelFa: "تعویق لایحه تا بهبود شاخص‌های مالی",
        descriptionFa: "حفظ نقدینگی در ازای دلسردی کادرهای نظامی.",
        effect: {
          stabilityDelta: -6,
        },
      },
    ],
  },
  {
    id: "air_defense_readiness_drill",
    titleFa: "رزمایش سراسری شبیه‌سازی تهاجم هوایی",
    headlineFa: "تست سامانه‌های راداری و آتشبارهای موشکی",
    descriptionFa:
      "فرماندهی پدافند درخواست اجرای مانور شلیک زنده موشک‌های ضدهوایی جهت ارزیابی رادارها دارد.",
    category: "MILITARY",
    urgency: "MEDIUM",
    choices: [
      {
        id: "conduct_drill",
        labelFa: "اجرای مانور کامل و کالیبراسیون سامانه‌ها",
        descriptionFa: "افزایش آمادگی و واحدهای پدافندی در ازای مصرف مهمات.",
        effect: {
          treasuryGdpPercent: -0.015,
          airDefenseDelta: 8,
          stabilityDelta: 3,
        },
      },
      {
        id: "simulator_only",
        labelFa: "اکتفا به شبیه‌سازی رایانه‌ای بدون شلیک زنده",
        descriptionFa: "صرفه‌جویی در بودجه بدون افزایش ادوات میدانی.",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
]);
