import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: "../../public/Vazirmatn.woff2",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "موتور محاسباتی ژئوپلیتیک",
  description: "شبیه‌ساز پیشرفته و داشبورد تصمیم‌گیری تاکتیکی",
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
