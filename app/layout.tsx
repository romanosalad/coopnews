import type { Metadata } from "next";
import { Fraunces, Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "block",
  variable: "--font-fraunces"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-space-grotesk"
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono"
});

// Inter — fonte de leitura para o Modo Foco (alta legibilidade, neutra,
// excelente para sessões longas e leitores neurodivergentes). Peso regular
// + medium para corpo. Carregada apenas em Latin para manter footprint baixo.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter"
});

import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND.name} — Inteligência editorial em marketing cooperativista`,
  description: BRAND.short_description,
  applicationName: BRAND.name,
  authors: [{ name: BRAND.founder_byline }],
  openGraph: {
    title: BRAND.name,
    description: BRAND.short_description,
    siteName: BRAND.name,
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.short_description
  }
};

// Inline antes da hidratação: aplica .focus-mode no <html> se a preferência
// já estava em localStorage. Evita flash de tema "normal" para quem volta ao
// portal com o Modo Foco ativo.
const focusModeBootstrap = `(function(){try{if(localStorage.getItem('briefing-focus-mode')==='1'){document.documentElement.classList.add('focus-mode');}}catch(_){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: focusModeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
