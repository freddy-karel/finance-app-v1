import { ReactNode } from "react";

export const metadata = { title: "Finance App V1" };

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Le header global est géré dans le layout racine `src/app/layout.tsx`. */}
        <main>{children}</main>
      </div>
    </div>
  );
}
