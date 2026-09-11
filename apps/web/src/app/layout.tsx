import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/presentation/context/toast-context";
import { StrategicToastContainer } from "@/presentation/components/common/strategic-toast-container";
import { OrientationGuard } from "@/presentation/components/common/orientation-guard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070a12",
};

export const metadata: Metadata = {
  title: "آخرین امپراتوری | بازی آنلاین استراتژیک ژئوپلیتیک",
  description:
    "شبیه‌ساز پیشرفته مدیریت کشور، دیپلماسی و نبردهای نظامی تاکتیکی در بازی آنلاین آخرین امپراتوری. قلمرو خود را توسعه دهید و جهان را تسخیر کنید.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground select-none overflow-hidden">
        <ToastProvider>
          {children}
          <StrategicToastContainer />
          <OrientationGuard />
        </ToastProvider>
      </body>
    </html>
  );
}
