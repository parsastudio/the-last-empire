import { NationalProjectConfig } from "@/domain/projects/national-project.schema";

export const PROJECT_STEP_FLAT_COST = 5_000_000_000;

export const NATIONAL_PROJECTS_CATALOG: readonly NationalProjectConfig[] =
  Object.freeze([
    {
      id: "automation_production_lines",
      nameFa: "رباتیک‌سازی پیشرفته کارخانجات",
      taglineFa: "جهش راندمان کارخانجات با هوش مصنوعی صنعتی",
      descriptionFa:
        "تجهیز سوله‌های صنعتی و خطوط مونتاژ به بازوهای خودکار و سنسورهای نسل جدید که بازدهی مالی و عواید کلیه کارخانجات کشور را ۱۰٪ افزایش می‌دهد.",
      category: "INDUSTRY_TECH",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factoryYieldBonusMultiplier: 0.1,
      },
    },
    {
      id: "rapid_deployment_doctrine",
      nameFa: "دکترین ترابری و واکنش ضربتی",
      taglineFa: "افزایش توان آتش و چابکی یگان‌های عملیاتی",
      descriptionFa:
        "سازمان‌دهی فرماندهی چابک و رزمایش‌های شبیه‌سازی‌شده که توان آتش و راندمان رزمی یگان‌های پیاده و زرهی را ۱۰٪ ارتقا می‌بخشد.",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        militaryPowerBonusMultiplier: 0.1,
      },
    },
    {
      id: "free_transit_gateways",
      nameFa: "توسعه بنادر و کریدورهای آزاد بازرگانی",
      taglineFa: "گسترش درآمدهای گمرکی و عواید ترانزیت فرامرزی",
      descriptionFa:
        "روان‌سازی ترخیص کالا، تخفیف‌های هدفمند تعرفه‌ای و توسعه اسکله‌های بندری که عواید حاصل از مبادلات بین‌المللی را ۱۵٪ افزایش می‌دهد.",
      category: "ECONOMIC",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.15,
      },
    },
    {
      id: "passive_defense_fortifications",
      nameFa: "دژهای زیرزمینی و خطوط دفاع بتنی",
      taglineFa: "کاهش تلفات ارتش در دفاع سرزمینی",
      descriptionFa:
        "احداث سنگرهای بتنی، مقرهای زیرزمینی و شبکه تونل‌های تاکتیکی که تلفات ارتش خودی در دفاع از خاک میهن را ۱۵٪ کاهش می‌دهد.",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        defenseCasualtyReductionMultiplier: 0.15,
      },
    },
    {
      id: "diplomatic_soft_power_network",
      nameFa: "گسترش سفارتخانه‌ها و قدرت نرم دیپلماتیک",
      taglineFa: "ارتقای پرستیژ و جایگاه رسمی در مجامع جهانی",
      descriptionFa:
        "تاسیس دفاتر رایزنی اقتصادی، کارزارهای فرهنگی و هیئت‌های دیپلماتیک فعال که پرستیژ بین‌المللی کشور را ۱۰ واحد افزایش دائمی می‌دهد.",
      category: "GEOPOLITICAL",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 10,
      },
    },
    {
      id: "smart_logistics_hub",
      nameFa: "آمادگاه دیجیتال و زنجیره تأمین هوشمند",
      taglineFa: "مهار هزینه‌های جاری نگهداری و ترابری ارتش",
      descriptionFa:
        "انبارداری خودکار مهمات، مدیریت مکانیزه سوخت و پایش ناوگان که مخارج نوبتی نگهداری تسلیحات و حقوق نیروها را ۱۰٪ کاهش می‌دهد.",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        maintenanceCostDiscountMultiplier: 0.1,
      },
    },
    {
      id: "integrated_laser_radar_grid",
      nameFa: "سپر پدافند موشکی و راداری یکپارچه",
      taglineFa: "پایش آسمان و رهگیری موشک‌ها و پهپادهای مهاجم",
      descriptionFa:
        "استقرار رادارهای آرایه فازی و آتشبارهای واکنش سریع که ۲۰٪ از موشک‌ها و پهپادهای متخاصم را پیش از اصابت در هوا منهدم می‌سازد.",
      category: "MILITARY",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        autoMissileInterceptionRate: 0.2,
      },
    },
    {
      id: "continental_energy_corridor",
      nameFa: "شاهراه انتقال انرژی و فیبر قاره‌ای",
      taglineFa: "پایداری استراتژیک زیرساخت‌ها و ایمنی ثبات ملی",
      descriptionFa:
        "ایجاد رینگ انتقال نیرو و شبکه مستقل فیبرنوری که پایداری اجتماعی کشور را در تنش‌ها تضمین کرده و ۸ واحد ثبات دائمی اعطا می‌کند.",
      category: "GEOPOLITICAL",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        permanentStabilityBonus: 8,
      },
    },
    {
      id: "electronic_warfare_ai_hub",
      nameFa: "مرکز جنگ الکترونیک و نظارت ماهواره‌ای",
      taglineFa: "اشراف اطلاعاتی تاکتیکی و اختلال در ناوبری دشمن",
      descriptionFa:
        "تجهیز پایگاه‌های شنود سیگنالی و ماهواره‌های شناسایی که پرستیژ امنیتی کشور را ۸ واحد ارتقا داده و ۵٪ به رهگیری پدافند هوایی کمک می‌کند.",
      category: "GEOPOLITICAL",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 8,
        autoMissileInterceptionRate: 0.05,
      },
    },
    {
      id: "nano_alloy_metallurgy",
      nameFa: "متالورژی نانوآلیاژها و مواد ترکیبی",
      taglineFa: "ارزان‌سازی احداث کارخانه و ساخت ادوات سنگین",
      descriptionFa:
        "دستیابی به فرمولاسیون کامپوزیت‌های سبک و مقاوم که مخارج احداث سوله‌ها و ساخت ماشین‌آلات و ادوات رزمی را ۱۵٪ ارزان‌تر می‌کند.",
      category: "INDUSTRY_TECH",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        procurementCostDiscountMultiplier: 0.15,
      },
    },
    {
      id: "national_industrial_zones",
      nameFa: "مناطق ویژه خودکفایی و زیرساخت صنایع سنگین",
      taglineFa: "گسترش ظرفیت سقف احداث کارخانه در سراسر کشور",
      descriptionFa:
        "آماده‌سازی اراضی صنعتی، شبکه برق مستقل و تأسیسات زیربنایی که سقف اسلات ساخت کارخانه را در تمام استان‌ها ۲۰٪ افزایش می‌دهد.",
      category: "INDUSTRY_TECH",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factorySlotExpansionRatio: 0.2,
      },
    },
    {
      id: "strategic_currency_clearing",
      nameFa: "پیمان پیام‌رسان و تسویه دوجانبه ارزی",
      taglineFa: "بهبود راندمان صادرات و بازدهی بازرگانی خارجی",
      descriptionFa:
        "راه‌اندازی سوئیفت ارزی مستقل و کانال‌های مالی پایدار با شرکا که عواید حاصل از صادرات و تجارت بین‌المللی را ۲۵٪ افزایش می‌دهد.",
      category: "ECONOMIC",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.25,
      },
    },
    {
      id: "quantum_fusion_grid",
      nameFa: "شبکه نیروگاه‌های گداخت هسته‌ای پایدار",
      taglineFa: "انرژی ارزان؛ محرک جهش ظرفیت و بازدهی صنایع",
      descriptionFa:
        "مهار انرژی گداخت که بازدهی تمام کارخانجات کشور را ۲۰٪ ارتقا داده و سقف اسلات‌های مجاز صنعتی را ۳۰٪ افزایش می‌دهد.",
      category: "INDUSTRY_TECH",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factoryYieldBonusMultiplier: 0.2,
        factorySlotExpansionRatio: 0.3,
      },
    },
    {
      id: "petro_currency_hegemony",
      nameFa: "سلطه بر بازار جهانی انرژی و پترودلار",
      taglineFa: "تسلط بر مبادلات ترانزیت و جریان نقدینگی بین‌الملل",
      descriptionFa:
        "الزام مبادلات راهبردی نفت و انرژی با پول ملی شما که عواید بازرگانی کشور را ۳۵٪ جهش داده و سهم ثابتی از گردش مالی جهانی به خزانه می‌افزاید.",
      category: "ECONOMIC",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.35,
        petroTributeShare: 0.002,
      },
    },
    {
      id: "strategic_deterrence_triad",
      nameFa: "سه‌گانه موشکی و بازدارندگی اتمی",
      taglineFa: "سپر بازدارنده نهایی در برابر تهاجم قدرت‌های بزرگ",
      descriptionFa:
        "سیلوهای موشک‌های دوربرد و زیردریایی‌های پنهانکار که تصمیم حریفان برای اعلان جنگ به شما را ۳۰٪ مهار کرده و ۱۰ امتیاز پرستیژ به همراه دارد.",
      category: "MILITARY",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        deterrenceWarThresholdMultiplier: 1.3,
        globalReputationBonus: 10,
      },
    },
    {
      id: "combined_arms_supremacy",
      nameFa: "سامانه ماهواره‌ای هدایت یکپارچه جنگ",
      taglineFa: "هم‌افزایی رزمی حداکثری میان تمام رسته‌ها در میدان",
      descriptionFa:
        "ادغام ارتباطی رادارهای هوابرد، تانک‌ها و پیاده‌نظام که قدرت رزمی و بقای کلیه یگان‌ها در صحنه نبرد را ۲۰٪ تقویت می‌نماید.",
      category: "MILITARY",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        militaryPowerBonusMultiplier: 0.2,
      },
    },
    {
      id: "multilateral_treaty_architecture",
      nameFa: "شورای عالی رهبری جهان (تسلط بر سازمان ملل)",
      taglineFa: "رهبری دیپلماسی جهانی و مصونیت سیاسی دائمی",
      descriptionFa:
        "تأسیس نهاد دائمی همکاری‌های بین‌المللی به محوریت کشور شما که ۲۰ واحد پرستیژ جهانی و ۱۰ واحد ثبات همیشگی به دولت اعطا می‌نماید.",
      category: "GEOPOLITICAL",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 20,
        permanentStabilityBonus: 10,
      },
    },
    {
      id: "advanced_robotics_defense_arsenal",
      nameFa: "صنایع دفاعی خودکار و تسلیحات تمام‌رباتیک",
      taglineFa: "کاهش بنیادین در مخارج نوسازی و هزینه‌های نگهداری ارتش",
      descriptionFa:
        "خطوط پیشرفته مونتاژ رباتیک که هزینه ساخت ادوات جنگی را ۲۰٪ و مخارج جاری نگهداری و حقوق ارتش را ۲۰٪ کاهش می‌دهد.",
      category: "INDUSTRY_TECH",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        procurementCostDiscountMultiplier: 0.2,
        maintenanceCostDiscountMultiplier: 0.2,
      },
    },
  ]);
