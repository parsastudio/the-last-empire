import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const CORE_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
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
    id: "superpower_sanction_threat",
    titleFa: "اولتیماتوم تحریمی ابرقدرت جهانی",
    headlineFa: "تهدید به محاصره اقتصادی و انسداد ترانزیت",
    descriptionFa:
      "سفیر یک ابرقدرت جهانی با اشاره به پیشرفت‌های اخیر شما، اولتیماتوم داده که یا بخشی از بازارهای خود را واگذار کنید یا تحت تحریم قرار گیرید.",
    category: "GEOPOLITICAL",
    urgency: "CRITICAL",
    choices: [
      {
        id: "concede_tariffs",
        labelFa: "اعطای امتیازات تجاری و پرداخت باج دیپلماتیک",
        descriptionFa:
          "پرداخت غرامت و مهار خشم ابرقدرت برای حفظ دسترسی به شاهراه‌های مالی بین‌المللی.",
        effect: {
          treasuryDelta: -18_000_000_000,
          stabilityDelta: -5,
          globalReputationDelta: 4,
        },
      },
      {
        id: "defiant_rejection",
        labelFa: "رد قاطع اولتیماتوم و اعلام جنگ تجاری",
        descriptionFa:
          "تقویت غرور ملی و ثبات حکومت در ازای ریسک انزوای بین‌المللی و کاهش اعتبار جهانی.",
        effect: {
          treasuryDelta: 0,
          stabilityDelta: 12,
          globalReputationDelta: -15,
        },
      },
    ],
  },
  {
    id: "enemy_tech_defector",
    titleFa: "پناهندگی دانشمند ارشد صنایع دفاعی دشمن",
    headlineFa: "فرصت سرقت فناوری در ازای تنش امنیتی",
    descriptionFa:
      "یکی از برجسته‌ترین طراحان تسلیحاتی کشور رقیب به همراه نقشه‌های سری سامانه‌های دفاعی خواستار پناهندگی سیاسی در خاک شما شده است.",
    category: "ESPIONAGE",
    urgency: "HIGH",
    choices: [
      {
        id: "grant_asylum",
        labelFa: "اعطای پناهندگی کامل و جذب دانشمند",
        descriptionFa:
          "جهش چشمگیر در فناوری نظامی و دانش پدافندی در ازای رسوایی اطلاعاتی و افت اعتبار.",
        effect: {
          treasuryDelta: -5_000_000_000,
          militaryTechDelta: 0.2,
          globalReputationDelta: -10,
        },
      },
      {
        id: "extradite_diplomat",
        labelFa: "استرداد محرمانه در ازای باج دیپلماتیک",
        descriptionFa:
          "تحویل فرد به کشور مبدأ در ازای دریافت غرامت نقدی سنگین و نمایش حسن‌نیت بین‌المللی.",
        effect: {
          treasuryDelta: 15_000_000_000,
          globalReputationDelta: 8,
          stabilityDelta: -4,
        },
      },
    ],
  },
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
  {
    id: "cyber_attack_grid",
    titleFa: "تهاجم سایبری به شبکه سراسری زیرساخت و پدافند",
    headlineFa: "نفوذ بدفزار ناشناس به سامانه‌های پدافند موشکی",
    descriptionFa:
      "یک حمله سایبری پیشرفته سامانه‌های کنترل راداری و پدافند هوایی کشور را مختل کرده است. باید فوراً بین نوسازی فایروال یا تمرکز بر پدافند تصمیم گرفت.",
    category: "ESPIONAGE",
    urgency: "CRITICAL",
    choices: [
      {
        id: "overhaul_firewall",
        labelFa: "نوسازی کامل شبکه و ارتقای امنیت سایبری",
        descriptionFa:
          "تخصیص بودجه کلان برای ایمن‌سازی سرورها و رشد دانش صنعتی و پدافندی کشور.",
        effect: {
          treasuryDelta: -14_000_000_000,
          industrialLevelDelta: 0.1,
          stabilityDelta: 4,
        },
      },
      {
        id: "restart_manually",
        labelFa: "راه‌اندازی دستی با پذیرش ریسک آسیب تجهیزات",
        descriptionFa:
          "صرفه‌جویی در مخارج در ازای از دست رفتن موقت بخشی از آتشبارهای پدافند هوایی.",
        effect: {
          treasuryDelta: 0,
          airDefenseDelta: -5,
          stabilityDelta: -5,
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
  {
    id: "peace_ultimatum_global",
    titleFa: "بیانیه الزام‌آور شورای بین‌الملل برای آتش‌بس",
    headlineFa: "فشار ابرقدرت‌ها برای توقف نبردها",
    descriptionFa:
      "جامعه جهانی با صدور قطعنامه‌ای خواستار پایان فوری تهاجمات نظامی کشور و پذیرش صلح شده و تهدید به تحریم همه‌جانبه تسلیحاتی کرده است.",
    category: "GEOPOLITICAL",
    urgency: "CRITICAL",
    choices: [
      {
        id: "accept_global_terms",
        labelFa: "پذیرش آتش‌بس و جلب حمایت‌های بین‌المللی",
        descriptionFa:
          "دریافت کمک‌های مالی و ارتقای پرستیژ جهانی در ازای افت نسبی غرور ملی.",
        effect: {
          treasuryDelta: 15_000_000_000,
          globalReputationDelta: 15,
          stabilityDelta: -4,
        },
      },
      {
        id: "condemn_resolution",
        labelFa: "محکوم کردن مداخله خارجی و ادامه عملیات",
        descriptionFa:
          "تداوم پیشروی و تقویت اقتدار داخلی در ازای کسر شدید پرستیژ و انزوای بین‌المللی.",
        effect: {
          stabilityDelta: 8,
          globalReputationDelta: -20,
        },
      },
    ],
  },
]);
