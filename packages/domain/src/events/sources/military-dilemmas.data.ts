import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const MILITARY_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "covert_arms_shipment",
    titleFa: "درخواست محرمانه خرید تسلیحات برای جنگ نیابتی",
    headlineFa: "سود سرشار تسلیحاتی در ازای فروش ذخایر",
    descriptionFa:
      "نمایندگان یک جناح درگیر در منطقه خواستار خرید فوری بخشی از ذخایر زرهی ارتش شما با پرداخت دوبرابر قیمت رسمی بازار نقدی هستند.",
    category: "MILITARY",
    urgency: "MEDIUM",
    choices: [
      {
        id: "sell_tanks",
        labelFa: "واگذاری فوری تانک‌ها و دریافت نقدینگی",
        descriptionFa:
          "تزریق ثروت کلان به خزانه ملی با کسر تعدادی از ادوات زرهی آماده رزم ارتش.",
        effect: {
          treasuryDelta: 20_000_000_000,
          armorDelta: -10,
          globalReputationDelta: -4,
        },
      },
      {
        id: "preserve_inventory",
        labelFa: "حفظ حداکثر آمادگی رزمی و رد معامله",
        descriptionFa:
          "نگهداری تمام ادوات در زرادخانه داخلی برای تضمین تمامیت ارضی و بازدارندگی ملی.",
        effect: {
          treasuryDelta: 0,
          stabilityDelta: 4,
          globalReputationDelta: 3,
        },
      },
    ],
  },
  {
    id: "strait_blockade_crisis",
    titleFa: "انسداد تنگه بین‌المللی و بحران دریانوردی",
    headlineFa: "دزدی دریایی و تهدید ناوگان بازرگانی",
    descriptionFa:
      "مسیر ترانزیت دریایی یکی از گلوگاه‌های اصلی با حضور دزدان دریایی و قایق‌های متخاصم مسدود شده و کشتی‌های تجاری تقاضای اسکورت دارند.",
    category: "MILITARY",
    urgency: "CRITICAL",
    choices: [
      {
        id: "deploy_naval_patrol",
        labelFa: "گسیل ناوگان دریایی و سرکوب قاطع راهزنان",
        descriptionFa:
          "صرف هزینه لجستیک برای پاکسازی آبراه و تثبیت اقتدار و پرستیژ جهانی نیروی دریایی.",
        effect: {
          treasuryDelta: -8_000_000_000,
          globalReputationDelta: 12,
          stabilityDelta: 5,
        },
      },
      {
        id: "ignore_crisis",
        labelFa: "بی‌تفاوتی و کاهش ریسک درگیری مستقیم",
        descriptionFa:
          "عدم مداخله نظامی که منجر به سقوط اعتبار دریایی و اعتراض تجار داخلی می‌شود.",
        effect: {
          treasuryDelta: 0,
          globalReputationDelta: -10,
          stabilityDelta: -6,
        },
      },
    ],
  },
  {
    id: "national_revanchism_wave",
    titleFa: "موج ناسیونالیسم و مطالبه بازپس‌گیری خاک تاریخی",
    headlineFa: "فشار افکار عمومی برای آغاز فتوحات سرزمینی",
    descriptionFa:
      "گردهمایی‌های بزرگ ملی در پایتخت خواهان اعلام موضع قاطع و تصرف اراضی مرزی شده‌اند. شور و شوق سربازگیری در کشور به اوج رسیده است.",
    category: "MILITARY",
    urgency: "HIGH",
    choices: [
      {
        id: "mobilize_volunteers",
        labelFa: "فراخوان سراسری سربازگیری و تجهیز لشکرهای داوطلب",
        descriptionFa:
          "افزایش رایگان لشکرهای پیاده‌نظام و روحیه جنگی در ازای افزایش تنش با همسایگان.",
        effect: {
          infantryDelta: 40,
          stabilityDelta: 6,
          globalReputationDelta: -8,
        },
      },
      {
        id: "pacify_crowd",
        labelFa: "دعوت به آرامش و تعهد به موازین دیپلماتیک",
        descriptionFa:
          "کاهش تنش و جلب احترام جامعه بین‌الملل در ازای دلسردی موقت افکار عمومی.",
        effect: {
          stabilityDelta: -6,
          globalReputationDelta: 10,
        },
      },
    ],
  },
]);
