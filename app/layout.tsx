import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Agentic RAG | Langbase",
  description: "Advanced AI Agent with Semantic Memory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} selection:bg-white selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
