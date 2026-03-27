import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eureka Burgers · Loyalty",
  description: "Programa de lealtad digital — BURGERS ARE ALWAYS A GOOD IDEA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full antialiased ${bebasNeue.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
