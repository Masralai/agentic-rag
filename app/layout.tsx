import type { Metadata, Viewport } from "next";
import { PT_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const ptSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-pt-serif",
  weight: ["400"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Psynapse",
  description: "Query your documents with natural language",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${ptSerif.variable} ${interTight.variable} ${jetbrainsMono.variable} bg-black text-white antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-black focus:outline-none"
        >
          Skip to main
        </a>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}