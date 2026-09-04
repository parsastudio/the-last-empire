import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const ECONOMIC_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "energy_reserves_boom",
    titleFa: "کشف حوزه جدید انرژی",
    headlineFa: "فرصت واگذاری امتیاز یا ذخیره‌سازی ملی",
    descriptionFa:
      "اکتشافات جدید زمین‌شناسی از وجود منابع غنی انرژی حکایت دارد. نحوه بهره‌برداری نیازمند تصمیم است.",
    category: "ECONOMIC",
    urgency: "HIGH",
    choices: [
      {
        id: "sell_concession",
        labelFa: "مزایده بین‌المللی امتیاز استخراج",
        descriptionFa:
          "تزریق فوری نقدینگی کلان به خزانه در ازای افت جزئی پرستیژ ملی.",
        effect: {
          treasuryGdpPercent: 0.04,
          globalReputationDelta: -5,
          stabilityDelta: 2,
        },
      },
      {
        id: "strategic_reserve",
        labelFa: "صنایع تبدیلی و فرآوری بومی",
        descriptionFa: "توسعه پالایشگاه‌های داخلی و جهش فناوری صنعتی کشور.",
        effect: {
          treasuryGdpPercent: -0.02,
          industrialLevelDelta: 0.2,
          stabilityDelta: 6,
        },
      },
    ],
  },
  {
    id: "supply_chain_bottleneck",
    titleFa: "انسداد زنجیره تأمین مواد اولیه",
    headlineFa: "کمبود فولاد و قطعات در کارخانجات",
    descriptionFa:
      "توقف خطوط ترانزیت واردات مواد اولیه باعث کاهش عرضه در صنایع سنگین کشور شده است.",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "subsidize_freight",
        labelFa: "پرداخت یارانه دولتی ترانزیت هوایی",
        descriptionFa: "خرید زمان و تداوم تولید بدون آسیب به بازدهی صنایع.",
        effect: {
          treasuryGdpPercent: -0.015,
          stabilityDelta: 4,
        },
      },
      {
        id: "ration_materials",
        labelFa: "سهمیه‌بندی منابع و انقباض موقت",
        descriptionFa: "صرفه‌جویی در مخارج خزانه به بهای افت موقت ثبات داخلی.",
        effect: {
          stabilityDelta: -8,
        },
      },
    ],
  },
  {
    id: "hyperinflation_threat",
    titleFa: "جهش نقدینگی و تهدید تورم",
    headlineFa: "سیاست پولی اضطراری بانک مرکزی",
    descriptionFa:
      "افزایش نقدینگی در بازارها منجر به فشار تورمی و کاهش قدرت خرید اقشار عمومی شده است.",
    category: "ECONOMIC",
    urgency: "HIGH",
    choices: [
      {
        id: "tighten_monetary",
        labelFa: "جمع‌آوری نقدینگی با انضباط مالی",
        descriptionFa: "مهار قطعی تورم و رشد ثبات در ازای رکود مقطعی درآمدها.",
        effect: {
          treasuryGdpPercent: -0.02,
          stabilityDelta: 10,
        },
      },
      {
        id: "price_controls",
        labelFa: "تعیین دستوری قیمت‌ها و بازرسی بازار",
        descriptionFa: "حفظ نقدینگی دولتی در ازای نارضایتی تجار و افت ثبات.",
        effect: {
          stabilityDelta: -10,
          globalReputationDelta: -4,
        },
      },
    ],
  },
  {
    id: "debt_relief_opportunity",
    titleFa: "پیشنهاد تسویه زودهنگام بدهی بین‌الملل",
    headlineFa: "تخفیف استثنایی بستانکاران خارجی",
    descriptionFa:
      "کنسرسیوم وام‌دهندگان پیشنهاد داده در صورت پرداخت فوری بخشی از بدهی، سود نوبتی کاهش یابد.",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "repay_bulk",
        labelFa: "پرداخت یکجای بدهی با تخفیف",
        descriptionFa:
          "کاهش بار بدهی ملی و ارتقای پرستیژ اعتباری کشور در جهان.",
        effect: {
          treasuryGdpPercent: -0.03,
          globalReputationDelta: 12,
          stabilityDelta: 4,
        },
      },
      {
        id: "decline_offer",
        labelFa: "حفظ کامل نقدینگی در خزانه",
        descriptionFa: "نگهداری پول نقد جهت پروژه‌های توسعه و آمادگی ارتش.",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
  {
    id: "industrial_patent_auction",
    titleFa: "حراج بین‌المللی گواهی‌های صنعتی",
    headlineFa: "فناوری نسل جدید خطوط مونتاژ",
    descriptionFa:
      "امتیاز چند اختراع بنیادین در زمینه رباتیک خطوط تولید در بازار آزاد عرضه شده است.",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "buy_patents",
        labelFa: "خرید انحصاری پتنت‌ها برای کارخانجات",
        descriptionFa: "ارتقای مستقیم لول صنعتی کشور با سرمایه‌گذاری نقدی.",
        effect: {
          treasuryGdpPercent: -0.025,
          industrialLevelDelta: 0.2,
        },
      },
      {
        id: "ignore_patents",
        labelFa: "صرف‌نظر و اتکا به پژوهشگاه‌های داخلی",
        descriptionFa: "پرهیز از هزینه و ادامه روند عادی توسعه R&D.",
        effect: {
          treasuryGdpPercent: 0,
        },
      },
    ],
  },
  {
    id: "foreign_trade_embargo_risk",
    titleFa: "تعرفه تنبیهی رقبای تجاری",
    headlineFa: "وضع عوارض سنگین بر صادرات کشور",
    descriptionFa:
      "بلوک رقیب برای تضعیف اقتصاد شما تعرفه‌های گمرکی سنگینی بر کالاهای صادراتی وضع کرده است.",
    category: "ECONOMIC",
    urgency: "HIGH",
    choices: [
      {
        id: "retaliate_tariffs",
        labelFa: "اقدام متقابل و تحریم کالاهای رقیب",
        descriptionFa: "نمایش صلابت ملی و رشد همبستگی در ازای تنش بین‌المللی.",
        effect: {
          stabilityDelta: 8,
          globalReputationDelta: -8,
        },
      },
      {
        id: "concede_lobby",
        labelFa: "مذاکره و اعطای مشوق‌های ارزی",
        descriptionFa:
          "پرداخت یارانه صادراتی جهت ابطال تعرفه‌ها و حفظ بازارها.",
        effect: {
          treasuryGdpPercent: -0.015,
          globalReputationDelta: 6,
        },
      },
    ],
  },
]);
