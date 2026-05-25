import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "TechPro 15 Pro | PC Portable Performant – Livraison Gratuite en Algérie",
  description:
    "PC portable TechPro 15 Pro : Intel i5, 16 Go RAM, SSD 512 Go, RTX 2050. Livraison gratuite dans toute l'Algérie. Paiement à la livraison disponible.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-text antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
