import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { ToastProvider } from "@/presentation/context/toast-context";
import { StrategicToastContainer } from "@/presentation/components/common/strategic-toast-container";
import { OrientationGuard } from "@/presentation/components/common/orientation-guard";
import { PwaRegister } from "@/presentation/components/common/pwa-register";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { pickMessages } from "@/i18n/pick-messages";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070a12",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    title: isEn
      ? "The Last Empire | Geopolitical Strategic Game"
      : "آخرین امپراتوری | بازی آنلاین استراتژیک ژئوپلیتیک",
    description: isEn
      ? "Advanced geopolitical simulation, statecraft, diplomacy, and tactical combat. Expand your domain and conquer the world."
      : "شبیه‌ساز پیشرفته مدیریت کشور، دیپلماسی و نبردهای نظامی تاکتیکی در بازی آنلاین آخرین امپراتوری. قلمرو خود را توسعه دهید و جهان را تسخیر کنید.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: isEn ? "The Last Empire" : "آخرین امپراتوری",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fa" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const layoutMessages = pickMessages(messages, ["common", "hud"]);
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground select-none overflow-hidden">
        <NextIntlClientProvider locale={locale} messages={layoutMessages}>
          <ToastProvider>
            {children}
            <StrategicToastContainer />
            <OrientationGuard />
            <PwaRegister />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
