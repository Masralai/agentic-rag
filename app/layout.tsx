import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({ 
  subsets: ["latin"], 
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Agentic-RAG",
  description: "Query your documents with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${mono.variable} bg-black text-white antialiased`}>
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