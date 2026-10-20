import type { Metadata } from "next";
import { Josefin_Sans, Noto_Sans_JP, Silkscreen } from "next/font/google";
import type { ReactNode } from "react";

import { Footer } from "@/components/home/Footer";
import { PillNav } from "@/components/nav/PillNav";

import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const kanaFont = Noto_Sans_JP({
  variable: "--font-kana",
  // Noto Sans JP has no selectable regional subset in Next's font metadata; omitting it keeps kana glyphs available.
  display: "swap",
  weight: ["400", "500", "700"],
});

const logoFont = Silkscreen({
  variable: "--font-logo",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Flash Card! — Japanese practice",
  description: "A cozy Japanese hiragana and katakana flashcard app by ShenNatsu.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${josefinSans.variable} ${kanaFont.variable} ${logoFont.variable} bg-canvas text-ink`}
      >
        <div className="site-shell">
          <PillNav />
          <div className="site-content">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
