import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const ECONOMIC_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "oil_gas_discovery",
    titleFa: "کشف میدان فوق‌عظیم انرژی و گاز",
    headlineFa: "شوک اقتصادی و طمع رقبای منطقه‌ای",
    descriptionFa:
      "تیم‌های زمین‌شناسی کشور یک میدان عظیم انرژی کشف کرده‌اند. بهره‌برداری فوری می‌تواند خزانه را متحول کند، اما طمع و حسادت قدرت‌های رقیب را برمی‌انگیزد.",
    category: "ECONOMIC",
    urgency: "HIGH",
    choices: [
      {
        id: "nationalize_and_sell",
        labelFa: "مزایده فوری به شرکت‌های بین‌المللی",
        descriptionFa:
          "فروش امتیاز استخراج و کسب سود سرشار نقدی در ازای افت نسبی پرستیژ استقلال ملی.",
        effect: {
          treasuryDelta: 25_000_000_000,
          globalReputationDelta: -5,
          stabilityDelta: 3,
        },
      },
      {
        id: "strategic_reserve",
        labelFa: "ذخیره‌سازی راهبردی و خودکفایی بومی",
        descriptionFa:
          "سرمایه‌گذاری خزانه در توسعه دانش استخراج بومی برای تقویت زیرساخت و ثبات کشور.",
        effect: {
          treasuryDelta: -10_000_000_000,
          industrialLevelDelta: 0.2,
          stabilityDelta: 8,
          globalReputationDelta: 5,
        },
      },
    ],
  },
  {
    id: "neighbor_debt_default",
    titleFa: "ورشکستگی همسایه و حراج دارایی‌های صنعتی",
    headlineFa: "فرصت تملک کارخانجات ارزان در شرایط بحران",
    descriptionFa:
      "دولت کشور همسایه به دلیل ناتوانی در بازپرداخت بدهی‌های IMF اعلام نکول کرده و آماده واگذاری بخشی از تجهیزات صنعتی به قیمت نمادین است.",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "buy_cheap_machinery",
        labelFa: "خرید فوری تجهیزات و انتقال به داخل",
        descriptionFa:
          "پرداخت مبلغی مناسب از خزانه برای جهش لول ماشین‌آلات و خطوط تولید بومی.",
        effect: {
          treasuryDelta: -15_000_000_000,
          industrialLevelDelta: 0.2,
          globalReputationDelta: 2,
        },
      },
      {
        id: "pass_opportunity",
        labelFa: "حفظ نقدینگی و پرهیز از ریسک‌های همسایه",
        descriptionFa:
          "نگهداری تمام نقدینگی در خزانه برای طرح‌های ضروری داخلی.",
        effect: {
          treasuryDelta: 0,
        },
      },
    ],
  },
  {
    id: "emergency_tax_levy",
    titleFa: "پیشنهاد وضع مالیات اضطراری جنگی بر اصناف",
    headlineFa: "تأمین فوری نقدینگی ارتش در ازای نارضایتی عمومی",
    descriptionFa:
      "وزارت اقتصاد پیشنهاد کرده برای تقویت توان مالی ارتش و پر کردن خزانه، مالیات ویژه‌ای بر ثروتمندان و بازرگانان وضع شود.",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "levy_tax",
        labelFa: "تصویب مالیات ویژه و شارژ خزانه‌داری",
        descriptionFa:
          "دریافت مبالغ سنگین نقدی در ازای افت شدید شاخص ثبات سیاسی داخلی.",
        effect: {
          treasuryDelta: 30_000_000_000,
          stabilityDelta: -16,
        },
      },
      {
        id: "tax_holiday",
        labelFa: "اعطای معافیت مالیاتی و جلب رضایت مردم",
        descriptionFa:
          "ارتقای چشمگیر محبوبیت و پایداری حکومت در ازای خالی ماندن دست خزانه.",
        effect: {
          treasuryDelta: -5_000_000_000,
          stabilityDelta: 14,
        },
      },
    ],
  },
]);
