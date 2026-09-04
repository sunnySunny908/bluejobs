import type { Metadata } from "next";
import Footer from "@/components/Footer"; // ✅ Already imported!
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobSwitchers - AI Finds Your Perfect Job in 60 Seconds", // ✅ Bas yahan capitalization improve ki
  description: "AI-powered job matching platform. Upload your CV and get matched with 7-day fresh jobs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-9427071028467343" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9427071028467343"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        
        {/* ✅ Footer yahan add kiya hai - Yeh automatically har page par dikhega */}
        <Footer />
        
      </body>
    </html>
  );
}