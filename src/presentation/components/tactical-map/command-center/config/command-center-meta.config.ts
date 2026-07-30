import { SidebarTabType } from "../../sidebar/sidebar-tabs";

export interface CommandCenterMeta {
  title: string;
  subtitle: string;
}

export function getCommandCenterMeta(
  activeTab: SidebarTabType | null,
  nationName: string,
): CommandCenterMeta {
  switch (activeTab) {
    case "overview":
      return {
        title: `شناسنامه و وضعیت عمومی ${nationName}`,
        subtitle: "پایش زنده اقتصاد، جمعیت، منابع و پایداری داخلی کشور",
      };
    case "market":
      return {
        title: "بورس بین‌المللی انرژی و فولاد",
        subtitle: "پایش قیمت‌های جهانی و انجام معاملات کلان منابع استراتژیک",
      };
    case "military":
      return {
        title: "ستاد کل نیروهای مسلح و تسلیحات",
        subtitle: "مدیریت یگان‌ها، صف ساخت، انحلال و ارتقای سطح فناوری دفاعی",
      };
    case "politics":
      return {
        title: "دیوان عالی سیاست و قوانین",
        subtitle: "تنظیم مالیات، تعرفه‌ها، وام‌های بین‌المللی و تغییر رژیم",
      };
    case "proxy":
      return {
        title: "مرکز عملیات‌های نیابتی و جنگ نفوذ",
        subtitle:
          "مدیریت عملیات پنهان، بودجه‌دهی نیابتی و پایش تخریب ثبات دشمنان",
      };
    case "diplomacy":
      return {
        title: "وزارت امور خارجه و دیپلماسی",
        subtitle: "روابط بین‌المللی، معاهدات دفاعی، حق عبور و مطالبه باج",
      };
    case "research":
      return {
        title: "پژوهشکده دکترین‌های راهبردی",
        subtitle: "توسعه شاخه‌های صنعتی و هژمونی بین‌المللی",
      };
    case "abilities":
      return {
        title: "فرمان‌های ویژه حکومتی",
        subtitle: "فعال‌سازی توانمندی‌های منحصر‌به‌فرد نظام سیاسی حاکم",
      };
    case "reports":
      return {
        title: "بایگانی گزارش‌های اطلاعاتی و حاکمیت",
        subtitle: "ارزیابی رویدادهای ملی و گزارش‌های پایش وضعیت",
      };
    default:
      return { title: "اتاق فرماندهی", subtitle: "" };
  }
}
