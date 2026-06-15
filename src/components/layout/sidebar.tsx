"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Heart,
  Activity,
  BarChart3,
  Rabbit,
  Settings,
  Menu,
  X,
  Wheat,
  Euro,
  Bell,
  Brain,
  Sun,
  CalendarCheck,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  {
    href: "/",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    href: "/inventaire",
    label: "Inventaire",
    icon: List,
  },
  {
    href: "/cycle-de-vie",
    label: "Cycle de Vie",
    icon: Heart,
  },
  {
    href: "/sante",
    label: "Santé",
    icon: Activity,
  },
  {
    href: "/alimentation",
    label: "Alimentation",
    icon: Wheat,
  },
  {
    href: "/finances",
    label: "Finances",
    icon: Euro,
  },
  {
    href: "/rapports",
    label: "Rapports",
    icon: BarChart3,
  },
  {
    href: "/diagnostic",
    label: "Diagnostic IA",
    icon: Brain,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/saisons",
    label: "Gestion saisonnière",
    icon: Sun,
  },
  {
    href: "/taches",
    label: "Calendrier tâches",
    icon: CalendarCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    const fetch_ = () =>
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => setNotifCount(d.count ?? 0))
        .catch(() => {});
    fetch_();
    const t = setInterval(fetch_, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-forest-700 text-cream-50 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2">
          <Rabbit className="h-6 w-6 text-sage-300" />
          <span className="font-bold text-lg">CuniGestion</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-forest-600 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-forest-700 text-cream-50 flex flex-col transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-forest-600 flex-shrink-0">
          <div className="w-9 h-9 bg-sage-400 rounded-lg flex items-center justify-center">
            <Rabbit className="h-5 w-5 text-forest-800" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">CuniGestion</p>
            <p className="text-xs text-sage-300 leading-tight">Ferme cuniculture</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-xs font-semibold text-sage-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-forest-500 text-cream-50"
                        : "text-sage-200 hover:bg-forest-600 hover:text-cream-50"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/notifications" && notifCount > 0 && (
                      <span className="ml-auto min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {notifCount > 99 ? "99+" : notifCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-forest-600 space-y-1">
          <Link
            href="/parametres"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sage-200 hover:bg-forest-600 hover:text-cream-50 transition-colors"
          >
            <Settings className="h-5 w-5" />
            Paramètres
          </Link>

          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-amber-500 text-amber-950"
                  : "text-amber-300 hover:bg-forest-600 hover:text-amber-200"
              )}
            >
              <Shield className="h-5 w-5" />
              Panneau Admin
            </Link>
          )}

          {/* User info + logout */}
          <div className="mt-2 px-3 py-2.5 bg-forest-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-sage-400 rounded-full flex items-center justify-center flex-shrink-0">
                {session?.user?.role === "ADMIN"
                  ? <Shield className="h-3.5 w-3.5 text-forest-800" />
                  : <User className="h-3.5 w-3.5 text-forest-800" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-cream-100 truncate">
                  {session?.user?.username ?? "Utilisateur"}
                </p>
                <p className="text-[10px] text-sage-400">
                  {session?.user?.role === "ADMIN" ? "Administrateur" : "Éleveur"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center gap-2 text-xs text-sage-300 hover:text-red-300 transition-colors py-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
