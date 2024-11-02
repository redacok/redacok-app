import RootProvider from "@/components/providers/root-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Projet Redacok",
  description: "Votre compte d'épargne à 10%",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <Toaster richColors position="bottom-right" />
      <body className={`${inter.className} antialiased h-full`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
