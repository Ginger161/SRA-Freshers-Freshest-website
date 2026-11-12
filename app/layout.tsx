import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Great_Vibes } from "next/font/google";
import Ambient from "@/components/Ambient";
import LiveFeed from "@/components/LiveFeed";
import RaceProvider from "@/components/RaceContext";
import RaceBanner from "@/components/RaceBanner";
import { CLOSES_AT, RACE_AT, SITE_URL } from "@/lib/config";
import "./globals.css";
import "./stage.css";
import "./race.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--f-serif" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-sans" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--f-script" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Freshest Fresher 2026/27 · Veritas University SRA",
  description: "Vote for the Freshest Fresher 2026/27. ₦100 per vote.",
  openGraph: {
    title: "Freshest Fresher 2026/27",
    description: "Vote for the Freshest Fresher. ₦100 per vote.",
    siteName: "Veritas University SRA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0C0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <RaceProvider raceAt={RACE_AT.getTime()} closesAt={CLOSES_AT.getTime()}>
          <Ambient />
          <RaceBanner />
          {children}
          <LiveFeed />
        </RaceProvider>
      </body>
    </html>
  );
}
