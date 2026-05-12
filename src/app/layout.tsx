import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CuniGestion - Gestion de ferme cuniculture",
  description: "Application de gestion pour ferme de lapins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-cream-100`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - hidden on mobile, visible on desktop */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <Sidebar />
          </div>
          {/* Mobile sidebar overlay */}
          <div className="lg:hidden">
            <Sidebar />
          </div>
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="pt-16 lg:pt-0 min-h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
