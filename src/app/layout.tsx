import "../styles/globals.css";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata = { title: "Finance App V1" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a href="#content" className="skip-link focus:ring">Aller au contenu</a>
        <div className="min-h-screen bg-surface text-white">
          <div className="max-w-5xl mx-auto p-6">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/" aria-label="Accueil" className="focus-ring">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold" aria-hidden="false">FA</div>
                </Link>
              </div>
              <Nav />
            </header>
            <main id="content" role="main" className="space-y-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
