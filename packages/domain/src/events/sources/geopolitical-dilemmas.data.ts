import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const GEOPOLITICAL_DILEMMA_EVENTS: readonly DilemmaEvent[] =
  Object.freeze([
    {
      id: "superpower_ultimatum",
      titleFa: "تهدید و باج‌خواهی ابرقدرت رقیب",
      headlineFa: "مطالبه امتیازات مرزی و تجاری",
      descriptionFa:
        "یکی از قدرت‌های برتر جهانی با ارسال یادداشتی خواستار سهم‌خواهی از درآمدهای ترانزیتی شما شده است.",
      category: "GEOPOLITICAL",
      urgency: "CRITICAL",
      choices: [
        {
          id: "pay_diplomatic_settlement",
          labelFa: "پرداخت سهم و مصالحه با ابرقدرت",
          descriptionFa:
            "جلوگیری از خطر انزوای بین‌المللی با پرداخت غرامت نقدی.",
          effect: {
            treasuryGdpPercent: -0.03,
            globalReputationDelta: 6,
            stabilityDelta: -4,
          },
        },
        {
          id: "defy_superpower",
          labelFa: "رد قاطعانه اولتیماتوم و اتکا به غیرت ملی",
          descriptionFa:
            "جهش غرور ملی و پایداری داخلی در ازای کسر اعتبار جهانی.",
          effect: {
            stabilityDelta: 10,
            globalReputationDelta: -16,
          },
        },
      ],
    },
    {
      id: "international_peace_accord",
      titleFa: "پیشنهاد میانجی‌گری در بحران منطقه‌ای",
      headlineFa: "فرصت ایفای نقش محوری در صلح بین‌الملل",
      descriptionFa:
        "سازمان ملل از دولت شما خواسته به عنوان ضامن آتش‌بس در مناقشه دو کشور همسایه ایفای نقش کند.",
      category: "GEOPOLITICAL",
      urgency: "HIGH",
      choices: [
        {
          id: "host_summit",
          labelFa: "میزبانی اجلاس صلح و تقبل هزینه‌ها",
          descriptionFa: "کسب پرستیژ خیره‌کننده جهانی در ازای مخارج دیپلماتیک.",
          effect: {
            treasuryGdpPercent: -0.015,
            globalReputationDelta: 16,
            stabilityDelta: 4,
          },
        },
        {
          id: "stay_neutral",
          labelFa: "اعلام بی‌طرفی و پرهیز از تعهدات خارجی",
          descriptionFa: "تمرکز بر امور داخلی بدون صرف هزینه.",
          effect: {
            globalReputationDelta: -4,
          },
        },
      ],
    },
    {
      id: "refugee_corridor_crisis",
      titleFa: "بحران آوارگان جنگی در مرزها",
      headlineFa: "ورود ده‌ها هزار پناهجو از خاک همسایه",
      descriptionFa:
        "در پی تشدید درگیری‌ها در کشور همجوار، موج گسترده‌ای از مهاجران پشت دروازه‌های مرزی تجمع کرده‌اند.",
      category: "GEOPOLITICAL",
      urgency: "HIGH",
      choices: [
        {
          id: "open_humanitarian_camps",
          labelFa: "پذیرش پناهجویان و دریافت کمک‌های بین‌المللی",
          descriptionFa:
            "ارتقای پرستیژ حقوق بشری در ازای بار مالی بر دوش دولت.",
          effect: {
            treasuryGdpPercent: -0.015,
            globalReputationDelta: 14,
            stabilityDelta: -3,
          },
        },
        {
          id: "seal_borders",
          labelFa: "انسداد کامل مرز با یگان‌های نظامی",
          descriptionFa:
            "حفظ امنیت و آرامش داخلی در ازای انتقادات تند بین‌المللی.",
          effect: {
            stabilityDelta: 5,
            globalReputationDelta: -12,
          },
        },
      ],
    },
    {
      id: "allied_loan_guarantee_request",
      titleFa: "درخواست ضمانت وام از سوی شریک استراتژیک",
      headlineFa: "استمداد مالی متحد برای نجات از ورشکستگی",
      descriptionFa:
        "یکی از دولت‌های هم‌پیمان شما به دلیل بحران نقدینگی خواستار تضمین بدهی‌های خود توسط خزانه شماست.",
      category: "GEOPOLITICAL",
      urgency: "MEDIUM",
      choices: [
        {
          id: "back_ally_loan",
          labelFa: "تضمین مالی و تحکیم عمیق ائتلاف",
          descriptionFa: "افزایش همبستگی دیپلماتیک در ازای ریسک مالی.",
          effect: {
            treasuryGdpPercent: -0.02,
            globalReputationDelta: 10,
            stabilityDelta: 3,
          },
        },
        {
          id: "refuse_guarantee",
          labelFa: "امتناع به دلیل ملاحظات اقتصادی داخلی",
          descriptionFa: "حفظ خزانه ملی در ازای دلسردی و رنجش شریک سیاسی.",
          effect: {
            globalReputationDelta: -8,
          },
        },
      ],
    },
    {
      id: "international_strait_claims",
      titleFa: "ادعای مالکیت دشمن بر آب‌های ساحلی شما",
      headlineFa: "تنش نظامی بر سر جزایر و مسیرهای دریایی",
      descriptionFa:
        "کشور مجاور نقشه‌ای منتشر کرده که بخشی از آب‌های آزاد مجاور سواحل شما را جزو منطقه انحصاری خود می‌داند.",
      category: "GEOPOLITICAL",
      urgency: "HIGH",
      choices: [
        {
          id: "show_of_force",
          labelFa: "اعزام ناوگان و گشت‌زنی مقتدرانه",
          descriptionFa:
            "تثبیت حاکمیت سرزمینی و افتخار ملی در ازای هزینه سوخت و آماده‌باش.",
          effect: {
            treasuryGdpPercent: -0.01,
            stabilityDelta: 7,
            globalReputationDelta: -4,
          },
        },
        {
          id: "arbitration_court",
          labelFa: "ارجاع پرونده به داوری بین‌المللی",
          descriptionFa: "نمایش تعهد به حقوق بین‌الملل و ارتقای اعتبار جهانی.",
          effect: {
            globalReputationDelta: 10,
            stabilityDelta: -4,
          },
        },
      ],
    },
    {
      id: "foreign_investment_wave",
      titleFa: "پیشنهاد سرمایه‌گذاری هلدینگ‌های فراملی",
      headlineFa: "توسعه زیرساخت‌ها با سرمایه خارجی",
      descriptionFa:
        "یک کنسرسیوم خارجی آمادگی دارد میلیاردها دلار در شبکه بنادر و جاده‌های کشور سرمایه‌گذاری کند.",
      category: "GEOPOLITICAL",
      urgency: "MEDIUM",
      choices: [
        {
          id: "accept_investment",
          labelFa: "پذیرش قرارداد و جذب سرمایه مستقیم",
          descriptionFa:
            "تزریق نقدینگی و افزایش پیوند جهانی با پذیرش نظارت خارجی.",
          effect: {
            treasuryGdpPercent: 0.03,
            globalReputationDelta: 8,
            stabilityDelta: -2,
          },
        },
        {
          id: "reject_for_sovereignty",
          labelFa: "رد پیشنهاد به دلیل حفظ استقلال راهبردی",
          descriptionFa: "حفظ حاکمیت مطلق اقتصادی بر زیرساخت‌های حیاتی کشور.",
          effect: {
            stabilityDelta: 6,
          },
        },
      ],
    },
  ]);
