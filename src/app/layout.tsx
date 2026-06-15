import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CuniGestion - Gestion de ferme cuniculture",
  description: "Application de gestion pour ferme de lapins",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-cream-100`}>
        <Providers session={session}>
          {session ? (
            <div className="flex h-screen overflow-hidden">
              <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar />
              </div>
              <div className="lg:hidden">
                <Sidebar />
              </div>
              <main className="flex-1 overflow-y-auto">
                <div className="pt-16 lg:pt-0 min-h-full">
                  {children}
                </div>
              </main>
            </div>
          ) : (
            <main className="min-h-screen">{children}</main>
          )}
        </Providers>
      </body>
    </html>
  );
}
