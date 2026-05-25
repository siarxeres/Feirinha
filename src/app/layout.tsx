import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://feirinhas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Feirinhas — Gestão de Feiras Livres",
    template: "%s | Feirinhas",
  },
  description:
    "Plataforma digital para gestão de feiras livres. Conecta organizadores, feirantes e consumidores em uma única solução.",
  keywords: ["feiras livres", "feirante", "organizador", "mercado", "gestão", "Brasil", "APRAMAR"],
  authors: [{ name: "Feirinhas" }],
  openGraph: {
    title: "Feirinhas — Gestão de Feiras Livres",
    description:
      "Plataforma digital para gestão de feiras livres. Conecta organizadores, feirantes e consumidores.",
    url: APP_URL,
    siteName: "Feirinhas",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feirinhas — Gestão de Feiras Livres",
    description:
      "Plataforma digital para gestão de feiras livres. Conecta organizadores, feirantes e consumidores.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
