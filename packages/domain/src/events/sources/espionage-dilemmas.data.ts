import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const ESPIONAGE_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
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
]);
