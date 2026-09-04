import { NationalProjectConfig } from "@/domain/projects/national-project.schema";

export const PROJECT_STEP_FLAT_COST = 5_000_000_000;

export const NATIONAL_PROJECTS_CATALOG: readonly NationalProjectConfig[] =
  Object.freeze([
    {
      id: "automation_production_lines",
      nameFa: "اتوماسیون رباتیک خطوط تولید",
      taglineFa: "افزایش خودکار راندمان کارخانجات",
      descriptionFa:
        "نصب خطوط مونتاژ خودکار و سنسورهای هوشمند در شهرک‌های صنعتی که بازدهی مالی و عواید کلیه کارخانجات کشور را ۱۵٪ افزایش می‌دهد.",
      category: "INDUSTRY_TECH",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factoryYieldBonusMultiplier: 0.15,
      },
    },
    {
      id: "rapid_deployment_doctrine",
      nameFa: "دکترین واکنش و مانور سریع ارتش",
      taglineFa: "ارتقای قدرت ضربتی یگان‌های رزمی",
      descriptionFa:
        "سازمان‌دهی فرماندهی چابک و رزمایش‌های شبیه‌سازی‌شده که توان آتش و کوبندگی یگان‌های پیاده و زرهی را ۱۵٪ ارتقا می‌بخشد.",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        militaryPowerBonusMultiplier: 0.15,
      },
    },
    {
      id: "free_transit_gateways",
      nameFa: "کریدورها و بنادر آزاد تجاری",
      taglineFa: "گسترش درآمدهای گمرکی و بازرگانی",
      descriptionFa:
        "تسهیل ترخیص کالا و معافیت‌های هدفمند در گلوگاه‌های مرزی که عواید حاصل از ترانزیت و تبادلات بین‌المللی را ۲۵٪ افزایش می‌دهد.",
      category: "ECONOMIC",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.25,
      },
    },
    {
      id: "passive_defense_fortifications",
      nameFa: "استحکامات پدافند غیرعامل مرزی",
      taglineFa: "کاهش تلفات در برابر تهاجم دشمن",
      descriptionFa:
        "احداث سنگرهای بتنی و شبکه تونل‌های تاکتیکی در مرزها که تلفات ارتش خودی در هنگام دفاع سرزمینی را ۲۵٪ کاهش می‌دهد.",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        defenseCasualtyReductionMultiplier: 0.25,
      },
    },
    {
      id: "diplomatic_soft_power_network",
      nameFa: "توسعه سفارتخانه‌ها و پرستیژ دیپلماتیک",
      taglineFa: "کسب اعتبار رسمی بین‌المللی",
      descriptionFa:
        "ایجاد دفاتر رایزنی اقتصادی و کارزارهای فرهنگی بین‌المللی که پرستیژ و جایگاه جهانی کشور را به میزان ۱۵ واحد ارتقا می‌دهد.",
      category: "GEOPOLITICAL",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 15,
      },
    },
    {
      id: "smart_logistics_hub",
      nameFa: "زنجیره تأمین و آمادگاه هوشمند ارتش",
      taglineFa: "مهار هزینه‌های نگهداری ماهانه",
      descriptionFa:
        "انبارداری دیجیتال و مکانیزاسیون سوخت‌رسانی که مخارج جاری نگهداری تسلیحات و دستمزد ماهانه ارتش را ۱۵٪ کاهش می‌دهد.",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        maintenanceCostDiscountMultiplier: 0.15,
      },
    },

    {
      id: "integrated_laser_radar_grid",
      nameFa: "شبکه پدافند موشکی یکپارچه",
      taglineFa: "رهگیری پیش‌دستانه موشک‌های تهاجمی",
      descriptionFa:
        "سامانه‌های راداری باند بلند که ۳۵٪ از موشک‌ها و پهپادهای تهاجمی حریف را پیش از برخورد به پدافند خودی در هوا متلاشی می‌کنند.",
      category: "MILITARY",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        autoMissileInterceptionRate: 0.35,
      },
    },
    {
      id: "continental_energy_corridor",
      nameFa: "کریدور فیبرنوری و لوله‌های انرژی",
      taglineFa: "ثبات پایدار داخلی و مهار بحران‌ها",
      descriptionFa:
        "خطوط مواصلاتی فراملی که پایداری سیاسی و همبستگی داخلی کشور را ۱۰٪ افزایش داده و مانع افت شدید ثبات در جنگ می‌شود.",
      category: "GEOPOLITICAL",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        permanentStabilityBonus: 10,
      },
    },
    {
      id: "electronic_warfare_ai_hub",
      nameFa: "مرکز شنود ماهواره‌ای و سایبری",
      taglineFa: "اشراف کامل اطلاعاتی بر تمامی کشورها",
      descriptionFa:
        "سامانه پایش هوشمند که اطلاعات زرادخانه، ذخایر خزانه و سطح فناوری کلیه کشورهای جهان را بدون نیاز به ارسال جاسوس برملا می‌کند.",
      category: "GEOPOLITICAL",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        fullOmniscienceIntel: true,
      },
    },
    {
      id: "nano_alloy_metallurgy",
      nameFa: "مجتمع‌های متالورژی نانوآلیاژ",
      taglineFa: "ارزان‌سازی ساخت و نوسازی ادوات",
      descriptionFa:
        "تولید آلیاژهای فوق‌سبک و مستحکم که هزینه‌های احداث سوله، خرید ادوات زرهی و خطوط تولید بومی را ۲۰٪ ارزان‌تر می‌کند.",
      category: "INDUSTRY_TECH",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        procurementCostDiscountMultiplier: 0.2,
      },
    },
    {
      id: "national_industrial_zones",
      nameFa: "مناطق ویژه خودکفایی صنعتی",
      taglineFa: "افزایش اسلات‌های احداث کارخانه",
      descriptionFa:
        "آماده‌سازی زمین‌های صنعتی و شبکه برق مستقل که ظرفیت سقف ساخت کارخانه در تمام استان‌ها را ۳۰٪ افزایش می‌دهد.",
      category: "INDUSTRY_TECH",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factorySlotExpansionRatio: 0.3,
      },
    },
    {
      id: "strategic_currency_clearing",
      nameFa: "پیمان پیام‌رسان و تسویه ارزی دوجانبه",
      taglineFa: "افزایش بهره‌وری ارزی از تجارت خارجی",
      descriptionFa:
        "راه‌اندازی سوئیفت مستقل ارزی که بازدهی عواید حاصل از صادرات و دکترین اقتصادی کشور را ۳۰٪ افزایش می‌دهد.",
      category: "ECONOMIC",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.3,
      },
    },

    {
      id: "quantum_fusion_grid",
      nameFa: "شبکه نیروگاه‌های گداخت هسته‌ای",
      taglineFa: "تأمین انرژی ارزان و جهش ظرفیت صنعتی",
      descriptionFa:
        "دستیابی به انرژی پایدار ارزان که بازدهی تمام کارخانجات کشور را ۲۵٪ ارتقا داده و سقف اسلات‌های صنعتی را ۵۰٪ بازتر می‌کند.",
      category: "INDUSTRY_TECH",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factoryYieldBonusMultiplier: 0.25,
        factorySlotExpansionRatio: 0.5,
      },
    },
    {
      id: "petro_currency_hegemony",
      nameFa: "پتروپیمان ارزی و هژمونی مبادلات",
      taglineFa: "اخذ سهم ثابت از نقدینگی جهان",
      descriptionFa:
        "الزام مبادلات انرژی به پول ملی کشور شما که در هر نوبت معادل ۱.۵٪ از کل درآمدهای ناخالص کشورهای صلح‌آمیز را به خزانه شما واریز می‌کند.",
      category: "ECONOMIC",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        petroTributeShare: 0.015,
      },
    },
    {
      id: "strategic_deterrence_triad",
      nameFa: "تکمیل سه‌گانه بازدارندگی راهبردی",
      taglineFa: "سپر بازدارنده در برابر تهاجم‌های ناگهانی",
      descriptionFa:
        "تجهیز موشک‌های قاره‌پیما و زیردریایی‌های پنهانکار که آستانه تصمیم هوش مصنوعی برای اعلان جنگ تک‌کشوری به شما را ۵۰٪ دشوارتر می‌کند.",
      category: "MILITARY",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        deterrenceWarThresholdMultiplier: 1.5,
      },
    },
    {
      id: "combined_arms_supremacy",
      nameFa: "دکترین جامع برتری رزم مشترک",
      taglineFa: "افزایش چشمگیر توان مانور تمام رسته‌ها",
      descriptionFa:
        "ادغام شبکه‌محور رادارهای پروازی، تانک‌ها و پیاده‌نظام که توان رزمی و بقای تمام یگان‌ها در میدان نبرد را ۲۵٪ ارتقا می‌دهد.",
      category: "MILITARY",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        militaryPowerBonusMultiplier: 0.25,
      },
    },
    {
      id: "multilateral_treaty_architecture",
      nameFa: "نظم نوین معاهدات بین‌المللی",
      taglineFa: "جهش نفوذ ژئوپلیتیک و ثبات دیپلماتیک",
      descriptionFa:
        "ایجاد مجمع دائمی همکاری‌های مشترک که ۲۵+ امتیاز پرستیژ دائمی و ۱۰+ ثبات سیاسی همیشگی به دولت اعطا می‌نماید.",
      category: "GEOPOLITICAL",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 25,
        permanentStabilityBonus: 10,
      },
    },
    {
      id: "advanced_robotics_defense_arsenal",
      nameFa: "مجتمع‌های تسلیحاتی تمام‌خودکار",
      taglineFa: "کاهش اساسی در هزینه‌های نوسازی و ارتش",
      descriptionFa:
        "خطوط تمام‌رباتیک ساخت تجهیزات سنگین که هزینه خرید تسلیحات و نگهداری ماهانه کل ارتش را به میزان ۳۰٪ کاهش می‌دهد.",
      category: "INDUSTRY_TECH",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        procurementCostDiscountMultiplier: 0.3,
        maintenanceCostDiscountMultiplier: 0.3,
      },
    },
  ]);
