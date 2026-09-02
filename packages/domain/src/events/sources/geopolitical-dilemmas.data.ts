import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const GEOPOLITICAL_DILEMMA_EVENTS: readonly DilemmaEvent[] =
  Object.freeze([
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
