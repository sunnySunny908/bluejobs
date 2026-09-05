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
  title: "JobSwitchers - AI Finds Your Perfect Job in 60 Seconds",
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
        {/* ✅ AdSense code commented out as requested */}
        {/* <meta name="google-adsense-account" content="ca-pub-9427071028467343" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9427071028467343"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        /> */}
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        
        {/* ✅ Footer yahan add kiya hai - Yeh automatically har page par dikhega */}
        <Footer />
        
        {/* ✅ Adsterra Social Bar - Added for monetization */}
        <Script
          src="https://pl31195798.profitableratecpmnetwork.com/c7/05/09/c70509e2b59f6ad27bd7445f5383701c.js"
          strategy="afterInteractive"
        />
        
      </body>
    </html>
  );
}