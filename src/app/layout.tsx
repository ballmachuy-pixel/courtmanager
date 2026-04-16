import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sunday - Sunset Basketball Academy | Đào tạo bóng rổ Thái Nguyên",
  description: "Học viện bóng rổ chuyên nghiệp tại Thái Nguyên. Đào tạo kỹ thuật, phát triển chiều cao và tư duy thi đấu bài bản cho trẻ em từ 5-16 tuổi.",
  manifest: "/manifest.json",
  keywords: ["bóng rổ", "Thái Nguyên", "học viện bóng rổ", "trẻ em", "vận động", "chiều cao", "Sunday Sunset"],
  openGraph: {
    title: "Sunday - Sunset Basketball Academy",
    description: "Nơi ươm mầm tài năng bóng rổ trẻ tại Thái Nguyên.",
    url: "https://court-manager.vercel.app",
    siteName: "Sunday Sunset",
    locale: "vi_VN",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sunday Sunset",
  },
};


export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
