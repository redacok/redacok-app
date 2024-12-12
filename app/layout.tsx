import RootProvider from "@/components/providers/root-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Projet Redacok | Compte d'épargne à 10%",
  description:
    "Découvrez Redacok, votre solution d'épargne innovante avec un rendement garanti de 10%. Investissez en toute sécurité et faites fructifier votre argent.",
  keywords:
    "épargne, investissement, rendement 10%, compte épargne, finance personnelle",
  authors: [{ name: "Landry Bella" }],
  openGraph: {
    title: "Projet Redacok | Compte d'épargne à 10%",
    description:
      "Découvrez Redacok, votre solution d'épargne innovante avec un rendement garanti de 10%",
    type: "website",
    locale: "fr_FR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <Toaster richColors position="bottom-right" expand={true} />
      <body className={`${inter.className} antialiased h-full`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
