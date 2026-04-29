"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Home,
  CreditCard,
  GitMerge,
  BookOpen,
  Bot,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Factures", href: "/factures", icon: FileText },
  { name: "Loyers", href: "/loyers", icon: Home },
  { name: "Rapprochement", href: "/rapprochement", icon: GitMerge },
  { name: "Écritures", href: "/ecritures", icon: BookOpen },
  { name: "Assistant IA", href: "/assistant", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold text-white">CogirBook</span>
        <span className="ml-2 rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">IA</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <Link
          href="/parametres"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          Paramètres
        </Link>
      </div>
    </aside>
  );
}
