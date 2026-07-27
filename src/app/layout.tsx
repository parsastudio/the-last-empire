import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: "../../public/Vazirmatn.woff2",
  variable: "--font-vazirmatn",
});

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
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
