import { NationalProjectConfig } from "@/domain/projects/national-project.schema";

export const PROJECT_STEP_FLAT_COST = 5_000_000_000;

export const NATIONAL_PROJECTS_CATALOG: readonly NationalProjectConfig[] =
  Object.freeze([
    {
      id: "automation_production_lines",
      nameFa: "اتوماسیون سراسری خطوط تولید",
      taglineFa: "جهش بهره‌وری در تمامی سوله‌های صنعتی کشور",
      descriptionFa:
        "استقرار سامانه‌های کنترل هوشمند و خطوط انتقال خودکار که بازدهی مالی تمام کارخانجات فعال کشور را به طور دائمی ۱۵٪ افزایش می‌دهد.",
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
      nameFa: "دکترین مانور و واکنش سریع",
      taglineFa: "هماهنگی تاکتیکی و افزایش کوبندگی ارتش",
      descriptionFa:
        "اجرای رزمایش‌های شبیه‌سازی‌شده و مدرنیزاسیون ساختار فرماندهی که قدرت آتش و تهاجم یگان‌های پیاده و زرهی را ۱۵٪ ارتقا می‌بخشد.",
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
      nameFa: "گذرگاه‌های ویژه ترانزیت و بنادر آزاد",
      taglineFa: "توسعه کریدورهای بازرگانی بین‌المللی",
      descriptionFa:
        "تسهیل مقررات گمرکی و تاسیس پایانه‌های ترانزیتی که عواید حاصل از بازرگانی جهانی و حق ترانزیت بنادر را ۲۵٪ افزایش می‌دهد.",
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
      nameFa: "رزمایش پدافند غیرعامل و استحکامات",
      taglineFa: "بتن‌ریزی سنگرها و تونل‌های تاکتیکی",
      descriptionFa:
        "تقویت شبکه پناهگاه‌ها و استحکامات دفاعی در تمامی استان‌ها که تلفات انسانی و زرهی نیروها در زمان تهاجم دشمن را ۳۰٪ کاهش می‌دهد.",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        defenseCasualtyReductionMultiplier: 0.3,
      },
    },
    {
      id: "integrated_laser_radar_grid",
      nameFa: "شبکه پدافند لیزری چندلایه",
      taglineFa: "رهگیری خودکار و انهدام آتشبار پیش از اصابت",
      descriptionFa:
        "نصب سنسورهای حرارتی و لیزرهای رهگیر که ۴۰٪ از موشک‌ها و پهپادهای شلیک‌شده دشمن را قبل از آغاز فاز اول نبرد نابود می‌کند.",
      category: "MILITARY",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        autoMissileInterceptionRate: 0.4,
      },
    },
    {
      id: "continental_energy_corridor",
      nameFa: "کریدور قاره‌ای شاهراه انرژی و فیبر",
      taglineFa: "شریان حیاتی ترانزیت و ثبات اقتصادی",
      descriptionFa:
        "اتصال خطوط لوله راهبردی و زیرساخت مخابراتی که ثبات سیاسی کشور را ۱۲٪ افزایش داده و مانع ریزش آن در هنگام بحران‌های منطقه‌ای می‌شود.",
      category: "GEOPOLITICAL",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        permanentStabilityBonus: 12,
      },
    },
    {
      id: "electronic_warfare_ai_hub",
      nameFa: "سازمان هوش مصنوعی و جنگ الکترونیک",
      taglineFa: "اشراف اطلاعاتی کامل بر تمامی زرادخانه‌ها",
      descriptionFa:
        "الگوریتم‌های رمزگشایی و شنود ماهواره‌ای که اطلاعات نظامی، اقتصادی و بودجه تمامی کشورهای جهان را به صورت دائمی و خودکار آشکار می‌سازد.",
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
      nameFa: "مجتمع‌های نانوفناوری و متالورژی پیشرفته",
      taglineFa: "کاهش چشمگیر هزینه‌های ریخته‌گری سنگین",
      descriptionFa:
        "فرمول‌های نوین آلیاژی و ریخته‌گری خودکفا که هزینه ساخت و واردات تمام تجهیزات صنعتی و لشکرهای زرهی را ۲۵٪ ارزان‌تر می‌کند.",
      category: "INDUSTRY_TECH",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        procurementCostDiscountMultiplier: 0.25,
      },
    },
    {
      id: "orbital_space_shield",
      nameFa: "سپر دفاعی مداری و ماهواره‌های فضایی",
      taglineFa: "مصونیت ۱۰۰٪ از هرگونه بمباران هوایی و موشکی",
      descriptionFa:
        "استقرار ماهواره‌های مدار پایین مجهز به پرتوهای پالسی که اصابت ۱۰۰٪ موشک‌ها، پهپادها و بمباران‌های هوایی متخاصمان را ناممکن می‌سازد.",
      category: "MILITARY",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        orbitalImmunityFromMissiles: true,
      },
    },
    {
      id: "petro_currency_hegemony",
      nameFa: "پتروپیمان پولی و هژمونی ارزی",
      taglineFa: "دریافت خراج نامحسوس از چرخه نقدینگی جهان",
      descriptionFa:
        "تسلط ارز ملی بر تسویه مبادلات انرژی که سالانه ۲٪ از درآمد ناخالص تمامی کشورهای غیرمتخاصم را مستقیماً به خزانه‌داری ملی واریز می‌کند.",
      category: "ECONOMIC",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        petroTributeShare: 0.02,
      },
    },
    {
      id: "quantum_fusion_core",
      nameFa: "نیروگاه‌های همجوشی کوانتومی",
      taglineFa: "انرژی بی‌پایان و دو برابر شدن اسلات‌های صنعتی",
      descriptionFa:
        "شکستن مرزهای فیزیک و تامین انرژی پاک نامحدود که سقف اسلات‌های ساخت کارخانه در تمامی استان‌های قلمرو کشور را ۲ برابر می‌کند.",
      category: "INDUSTRY_TECH",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        doubleMaxFactorySlots: true,
      },
    },
    {
      id: "ultimate_deterrence_pact",
      nameFa: "دکترین بازدارندگی نهایی",
      taglineFa: "سلطه کامل بر موازنه وحشت بین‌المللی",
      descriptionFa:
        "دستیابی به قابلیت پاسخ ویرانگر فوری که اعلام جنگ مستقیم تک‌کشوری علیه شما را غیرممکن ساخته و رقبا را فقط به ائتلاف جمعی محدود می‌کند.",
      category: "GEOPOLITICAL",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        preventDirectWarWithoutCoalition: true,
      },
    },
  ]);
