import type { Metadata } from "next";
import { Noto_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IFR / ISR Dashboard — ความปลอดภัย",
  description:
    "Dashboard ติดตามอัตราความถี่ (IFR) และความรุนแรง (ISR) ของอุบัติเหตุ แยกพนักงาน / ลูกจ้าง ตามปีงบประมาณ ต.ค.–ก.ย.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoThai.variable} ${inter.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}