import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const ESPIONAGE_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "defector_scientist_asylum",
    titleFa: "پناهندگی دانشمند هسته‌ای حریف",
    headlineFa: "اسرار محرمانه تسلیحاتی در ازای حمایت",
    descriptionFa:
      "یک مقام ارشد صنایع دفاعی رقیب به همراه نقشه‌های فنی پروژه‌های موشکی به سفارت شما گریخته است.",
    category: "ESPIONAGE",
    urgency: "HIGH",
    choices: [
      {
        id: "grant_full_asylum",
        labelFa: "اعطای تابعیت و استخراج داده‌های فنی",
        descriptionFa:
          "جهش سریع در فناوری نظامی در ازای خشم شدید دیپلماتیک دشمن.",
        effect: {
          treasuryGdpPercent: -0.015,
          militaryTechDelta: 0.15,
          globalReputationDelta: -10,
        },
      },
      {
        id: "extradite_secretly",
        labelFa: "استرداد در ازای توافق پنهانی امتیازات",
        descriptionFa:
          "دریافت امتیازات تجاری و نمایش حسن‌نیت به جامعه بین‌الملل.",
        effect: {
          treasuryGdpPercent: 0.02,
          globalReputationDelta: 8,
          stabilityDelta: -4,
        },
      },
    ],
  },
  {
    id: "cyber_grid_intrusion",
    titleFa: "تهاجم سایبری به شبکه راداری",
    headlineFa: "اختلال موقت در سامانه‌های پدافند هوایی",
    descriptionFa:
      "تیم‌های پدافند سایبری نفوذ بدافزاری پیچیده به اتاق‌های فرماندهی پدافند را شناسایی کرده‌اند.",
    category: "ESPIONAGE",
    urgency: "CRITICAL",
    choices: [
      {
        id: "total_system_overhaul",
        labelFa: "جداسازی شبکه و ارتقای فایروال‌ها",
        descriptionFa: "ارتقای دانش فنی و امنیت دائمی با صرف بودجه تخصصی.",
        effect: {
          treasuryGdpPercent: -0.02,
          industrialLevelDelta: 0.1,
          stabilityDelta: 3,
        },
      },
      {
        id: "quick_patch",
        labelFa: "وصله سریع امنیتی با پذیرش آسیب جزئی",
        descriptionFa:
          "صرفه‌جویی در هزینه با آسیب دیدن بخشی از سامانه‌های پدافند.",
        effect: {
          airDefenseDelta: -4,
          stabilityDelta: -4,
        },
      },
    ],
  },
  {
    id: "mole_in_general_staff",
    titleFa: "جاسوس نفوذی در ستاد مشترک ارتش",
    headlineFa: "افشای برنامه‌های جابه‌جایی قوا",
    descriptionFa:
      "سرویس ضدجاسوسی مدارکی از ارسال نقشه‌های عملیاتی ارتش به سفارت کشور رقیب کشف کرده است.",
    category: "ESPIONAGE",
    urgency: "CRITICAL",
    choices: [
      {
        id: "public_military_tribunal",
        labelFa: "محاکمه علنی و پاکسازی گسترده کادرها",
        descriptionFa:
          "تقویت سلامت ارتش و اعتماد عمومی در ازای افت کوتاه‌مدت روحیه.",
        effect: {
          stabilityDelta: 8,
          infantryDelta: -5,
          globalReputationDelta: 4,
        },
      },
      {
        id: "double_agent_trap",
        labelFa: "تبدیل به عامل دوطرفه و انتشار اطلاعات فریب",
        descriptionFa:
          "انحراف محاسبات دشمن و کسب برتری اطلاعاتی با عملیات محرمانه.",
        effect: {
          treasuryGdpPercent: -0.01,
          militaryTechDelta: 0.1,
        },
      },
    ],
  },
  {
    id: "foreign_satellite_blackout",
    titleFa: "جنگ الکترونیک ماهواره‌ای در فضا",
    headlineFa: "ارسال سیگنال‌های پارازیت کورکننده",
    descriptionFa:
      "ماهواره‌های ناوبری ارتش در حال حاضر تحت هجوم امواج کورکننده پایگاه‌های زمینی حریف هستند.",
    category: "ESPIONAGE",
    urgency: "MEDIUM",
    choices: [
      {
        id: "deploy_anti_jamming",
        labelFa: "تجهیز فرستنده‌های ضدپارازیت فرکانس متغیر",
        descriptionFa:
          "ایمن‌سازی ارتباطات پهپادی و موشکی با سرمایه‌گذاری ارزی.",
        effect: {
          treasuryGdpPercent: -0.015,
          droneMissileDelta: 8,
        },
      },
      {
        id: "switch_inertial_guidance",
        labelFa: "اتکا به ناوبری اینرسی سنتی بدون خرج اضافی",
        descriptionFa: "حفظ نقدینگی با پذیرش افت نسبی دقت سامانه‌های هوایی.",
        effect: {
          stabilityDelta: -2,
        },
      },
    ],
  },
  {
    id: "dissident_propaganda_campaign",
    titleFa: "کارزار پخش اخبار جعلی توسط رسانه‌های معاند",
    headlineFa: "پمپاژ شایعات اقتصادی برای تضعیف پول ملی",
    descriptionFa:
      "ربات‌های سایبری وابسته به رقبا شایعه ورشکستگی بانک‌های کشور را در شبکه‌ها منتشر می‌کنند.",
    category: "ESPIONAGE",
    urgency: "MEDIUM",
    choices: [
      {
        id: "counter_info_center",
        labelFa: "تأسیس مرکز شفافیت و آرام‌سازی بازارها",
        descriptionFa:
          "بازگشت قاطع آرامش و اعتماد به جامعه با هزینه اطلاع‌رسانی.",
        effect: {
          treasuryGdpPercent: -0.01,
          stabilityDelta: 9,
        },
      },
      {
        id: "ignore_rumors",
        labelFa: "بی‌اعتنایی رسمی و تکذیب ساده",
        descriptionFa:
          "پرهیز از هزینه در ازای ماندگاری بخشی از تنش و بدبینی داخلی.",
        effect: {
          stabilityDelta: -7,
        },
      },
    ],
  },
  {
    id: "industrial_espionage_syndicate",
    titleFa: "سرقت فایل‌های طراحی صنایع زرهی",
    headlineFa: "تلاش برای فروش نقشه‌های تانک به کشورهای ثالث",
    descriptionFa:
      "پلیس فرامرزی شبکه‌ای را در فرودگاه دستگیر کرده که حاوی طرح‌های مهندسی زره کامپوزیت است.",
    category: "ESPIONAGE",
    urgency: "HIGH",
    choices: [
      {
        id: "secure_rd_facilities",
        labelFa: "حفاظت فوق‌امنیتی از آزمایشگاه‌های مهندسی",
        descriptionFa: "توسعه استانداردهای امنیتی R&D و رشد دانش صنعتی کشور.",
        effect: {
          treasuryGdpPercent: -0.015,
          industrialLevelDelta: 0.1,
          stabilityDelta: 3,
        },
      },
      {
        id: "swift_interrogation",
        labelFa: "بازجویی سریع و مصادره اموال شبکه خلافکار",
        descriptionFa:
          "واریز دارایی‌های مسدودشده به خزانه بدون تغییر در سیستم حفاظتی.",
        effect: {
          treasuryGdpPercent: 0.015,
          globalReputationDelta: -2,
        },
      },
    ],
  },
]);
