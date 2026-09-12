export interface FeedMessageItem {
  id: string;
  type: "warning" | "danger" | "info" | "combat";
  textFa: string;
  textEn: string;
  timeFa: string;
  timeEn: string;
}

export const INITIAL_BRIEFING_MESSAGES: FeedMessageItem[] = [
  {
    id: "1",
    type: "info",
    textFa: "محموله تسلیحاتی جدید وارد پادگان‌های خط مقدم شد.",
    textEn: "Fresh arms shipment delivered to frontline garrison depots.",
    timeFa: "لحظاتی پیش",
    timeEn: "Just now",
  },
  {
    id: "2",
    type: "danger",
    textFa: "گزارش بحران: تورم بالا و آغاز موج اعتصابات کارگری در پایتخت.",
    textEn:
      "Crisis report: High inflation sparks labor strikes across capital.",
    timeFa: "۲ دقیقه پیش",
    timeEn: "2 min ago",
  },
  {
    id: "3",
    type: "warning",
    textFa: "بحران زیرساخت: اشغال حداکثری ظرفیت صنعتی استان مرکزی.",
    textEn:
      "Infrastructure alert: Industrial slot saturation in central provinces.",
    timeFa: "۵ دقیقه پیش",
    timeEn: "5 min ago",
  },
  {
    id: "4",
    type: "info",
    textFa: "رصد اطلاعاتی: تردد کاروان‌های تسلیحاتی در نزدیکی مرز مشترک.",
    textEn: "Intel surveillance: Military convoys tracked near shared border.",
    timeFa: "۸ دقیقه پیش",
    timeEn: "8 min ago",
  },
  {
    id: "5",
    type: "info",
    textFa: "عملیات هوایی: آغاز گشت‌زنی مداوم جنگنده‌ها بر فراز نوار مرزی.",
    textEn:
      "Air wing patrol: Persistent fighter sorties launched over perimeter.",
    timeFa: "۱۲ دقیقه پیش",
    timeEn: "12 min ago",
  },
  {
    id: "6",
    type: "warning",
    textFa: "هشدار مالی: کسری بودجه دولت، سقف وام خارجی را تهدید می‌کند.",
    textEn:
      "Fiscal warning: National budget deficit nearing external credit limit.",
    timeFa: "۱۵ دقیقه پیش",
    timeEn: "15 min ago",
  },
  {
    id: "7",
    type: "info",
    textFa: "پیشنهاد رسمی دولت همسایه جهت امضای پیمان عدم تخاصم دریافت شد.",
    textEn: "Official proposal received from neighbor for Non-Aggression Pact.",
    timeFa: "۲۰ دقیقه پیش",
    timeEn: "20 min ago",
  },
  {
    id: "8",
    type: "danger",
    textFa: "کد قرمز امنیت: شورش خیابانی و افت شدید ثبات حاکمیت در کشور.",
    textEn:
      "Security Code Red: Civil unrest triggers sharp drop in regime stability.",
    timeFa: "۲۵ دقیقه پیش",
    timeEn: "25 min ago",
  },
  {
    id: "9",
    type: "warning",
    textFa: "فشار بودجه: هزینه‌های سرسام‌آور حقوق و نگهداری یگان‌های ارتش.",
    textEn:
      "Budget pressure: Armed forces payroll maintenance burdens treasury.",
    timeFa: "۳۰ دقیقه پیش",
    timeEn: "30 min ago",
  },
  {
    id: "10",
    type: "info",
    textFa: "ستاد کل: ارزیابی سطح آمادگی رزمی نیروها در تمام پایگاه‌ها ثبت شد.",
    textEn:
      "General Staff: Combat readiness audits finalized across all commands.",
    timeFa: "۳۵ دقیقه پیش",
    timeEn: "35 min ago",
  },
  {
    id: "11",
    type: "info",
    textFa: "جهش صنعتی: تکمیل فاز مدرن‌سازی کارخانجات سنگین کشور.",
    textEn:
      "Industrial milestone: Heavy manufacturing modernization phase complete.",
    timeFa: "۴۰ دقیقه پیش",
    timeEn: "40 min ago",
  },
  {
    id: "12",
    type: "danger",
    textFa: "افت نرخ رشد جمعیت کشور به دلیل ناآرامی‌ها و کاهش شاخص ثبات.",
    textEn: "Demographic contraction recorded amid civil friction and unrest.",
    timeFa: "۴۵ دقیقه پیش",
    timeEn: "45 min ago",
  },
  {
    id: "13",
    type: "warning",
    textFa: "اولتیماتوم بانک جهانی: اخطار تسویه بهره وام‌ها به خزانه‌داری.",
    textEn:
      "World Bank ultimatum: Overdue interest settlement notice delivered.",
    timeFa: "۵۰ دقیقه پیش",
    timeEn: "50 min ago",
  },
  {
    id: "14",
    type: "info",
    textFa:
      "رونق بازار کار: ثبت بازدهی مثبت نیروی کار در کارخانجات سراسر کشور.",
    textEn: "Labor output boom: Positive productivity index across facilities.",
    timeFa: "۱ ساعت پیش",
    timeEn: "1 hour ago",
  },
  {
    id: "15",
    type: "info",
    textFa: "گشت‌های مرزی: امنیت کامل و روان بودن ترانزیت تجاری در مرزها.",
    textEn: "Border checkpoint report: Trade corridors secure and flowing.",
    timeFa: "۱ ساعت پیش",
    timeEn: "1 hour ago",
  },
  {
    id: "16",
    type: "danger",
    textFa:
      "هشدار ضدجاسوسی: اجرای طرح ضربتی پاکسازی نفوذی‌ها در دستگاه‌های اجرایی.",
    textEn:
      "Counter-intel alert: Infiltration ring neutralized inside ministries.",
    timeFa: "۱ ساعت پیش",
    timeEn: "1 hour ago",
  },
  {
    id: "17",
    type: "warning",
    textFa: "اعتراض بازرگانان به دلیل افزایش تعرفه‌ها و کاهش مبادلات فرامرزی.",
    textEn: "Merchant protests erupt following border tariff adjustments.",
    timeFa: "۲ ساعت پیش",
    timeEn: "2 hours ago",
  },
  {
    id: "18",
    type: "info",
    textFa: "دستورالعمل ارتقای فناوری پدافندی در ستاد کل آماده ابلاغ است.",
    textEn: "Air Defense directive drafted for immediate missile dome upgrade.",
    timeFa: "۲ ساعت پیش",
    timeEn: "2 hours ago",
  },
  {
    id: "19",
    type: "danger",
    textFa: "عملیات ویژه: نفوذ موفق تیم‌های خرابکاری به شبکه راداری دشمن.",
    textEn: "Covert black ops: Sabotage team disabled adversary radar network.",
    timeFa: "۳ ساعت پیش",
    timeEn: "3 hours ago",
  },
  {
    id: "20",
    type: "info",
    textFa: "پایداری حداکثری: رشد منظم جمعیت و پایداری جامعه در سایه ثبات ملی.",
    textEn:
      "National Golden Age: Steadfast governance solidifies civic stability.",
    timeFa: "۳ ساعت پیش",
    timeEn: "3 hours ago",
  },
];
