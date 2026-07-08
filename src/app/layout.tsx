import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { SITE_CONFIG } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: "Mkulima — Smart Farming Assistant",
  description:
    "AI-powered agricultural advisor for Tanzanian farmers. Crop guidance, pest diagnosis, weather tips, and seasonal calendars in Swahili and English.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Mkulima — Smart Farming Assistant",
    description: "AI-powered farming advisor for Tanzania",
    url: SITE_CONFIG.domain,
    siteName: "Mkulima",
    locale: "sw_TZ",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mkulima",
  },
};

export const viewport: Viewport = {
  themeColor: "#2d5016",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw" className={`${dmSans.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full grain-bg antialiased">
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-cream">
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
