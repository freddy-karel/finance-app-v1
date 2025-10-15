"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  HomeIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Entrées" },
  { href: "/expenses", label: "Dépenses" },
  { href: "/distribution", label: "Distribution" },
  { href: "/settings/envelopes", label: "Enveloppes" },
  { href: "/settings/distribution", label: "Répartition" },
  { href: "/settings/services", label: "Prestations" },
  { href: "/anomalies", label: "Anomalies" },
  { href: "/reports", label: "Rapports" },
];

export default function Nav() {
  const pathname = usePathname() || "/";

  return (
    <nav className="flex gap-3 text-sm items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = ((): any => {
          switch (item.href) {
            case "/dashboard": return HomeIcon;
            case "/transactions": return BanknotesIcon;
            case "/expenses": return CurrencyDollarIcon;
            case "/distribution": return ReceiptPercentIcon;
            case "/reports": return DocumentTextIcon;
            case "/anomalies": return ExclamationTriangleIcon;
            default: return ChartBarIcon;
          }
        })();

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive
              ? "flex items-center gap-2 px-4 py-2 rounded-md bg-primary/95 text-white shadow-md transition transform-gpu hover:scale-[1.02]"
              : "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-primary/10 transition text-white/90 hover:scale-[1.01]"}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
          >
            <Icon className="w-4 h-4 text-white/90" />
            <span className="align-middle">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


