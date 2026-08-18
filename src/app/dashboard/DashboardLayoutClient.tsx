"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  PiUser,
  PiGear,
  PiSignOut,
  PiList,
  PiX,
  PiChartBar,
  PiCrown,
  PiArrowSquareOut,
  PiCurrencyDollar
} from "react-icons/pi";

interface DashboardLayoutClientProps {
  user: any;
  profile: any;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  user,
  profile,
  children,
}: DashboardLayoutClientProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/profile", icon: PiUser, label: "Perfil" },
    { href: "/dashboard/monetization", icon: PiCurrencyDollar, label: "Monetización" },
    { href: "/dashboard/analytics", icon: PiChartBar, label: "Analíticas" },
    { href: "/dashboard/settings", icon: PiGear, label: "Ajustes" },
  ];

  if (profile?.is_admin) {
    navItems.push({ href: "/admin", icon: PiCrown, label: "Admin" });
  }

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0];

  return (
    <div className="flex h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] overflow-hidden">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="w-64 border-r border-[#eeeeee] dark:border-[#222] h-full p-6 hidden md:flex flex-col flex-shrink-0 bg-white dark:bg-[#050505]">
        <div className="text-2xl font-extrabold tracking-tighter mb-10">bioly.</div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer ${
                  isActive
                    ? "bg-[#f9fafb] dark:bg-[#111] text-[#111111] dark:text-white border border-[#eeeeee] dark:border-[#333] font-semibold"
                    : "text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* User profile preview in desktop sidebar bottom */}
        {username && (
          <div className="mb-4 px-4 py-3 bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-[#555] dark:text-[#a1a1aa] truncate max-w-[120px]">
              bioly.space/{username}
            </span>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#999] hover:text-[#111] dark:hover:text-white transition-colors"
            >
              <PiArrowSquareOut className="w-4 h-4" />
            </a>
          </div>
        )}

        <Link
          href="/auth/signout" prefetch={false}
          className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:text-red-500 transition-colors rounded-xl text-sm font-medium cursor-pointer"
        >
          <PiSignOut className="w-4 h-4" />
          Cerrar sesión
        </Link>
      </aside>

      {/* ── MOBILE NAV OVERLAY ── */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0a0a0a] border-r border-[#eeeeee] dark:border-[#222] p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-10">
              <div className="text-2xl font-extrabold tracking-tighter">bioly.</div>
              <button onClick={() => setIsMobileNavOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors cursor-pointer">
                <PiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 flex-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-colors font-medium text-base cursor-pointer ${
                      isActive
                        ? "bg-[#f9fafb] dark:bg-[#111] text-[#111111] dark:text-white border border-[#eeeeee] dark:border-[#333] font-semibold"
                        : "text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111]"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {username && (
              <div className="mb-4 px-4 py-3 bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555] dark:text-[#a1a1aa] truncate">
                  bioly.space/{username}
                </span>
                <a
                  href={`/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#999] hover:text-[#111] dark:hover:text-white transition-colors"
                >
                  <PiArrowSquareOut className="w-4 h-4" />
                </a>
              </div>
            )}

            <Link href="/auth/signout" prefetch={false} className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:text-red-500 transition-colors rounded-xl text-sm font-medium cursor-pointer">
              <PiSignOut className="w-4 h-4" />
              Cerrar sesión
            </Link>
          </nav>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeeeee] dark:border-[#222] bg-white dark:bg-[#050505] md:hidden flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileNavOpen(true)} className="p-2 border border-[#eeeeee] dark:border-[#222] rounded-xl hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer">
              <PiList className="w-5 h-5" />
            </button>
            <span className="text-xl font-extrabold tracking-tighter">bioly.</span>
          </div>
          {/* Signout shortcut on mobile header */}
          <Link href="/auth/signout" prefetch={false} className="p-2 border border-[#eeeeee] dark:border-[#222] rounded-xl hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer text-[#555] dark:text-[#a1a1aa]">
            <PiSignOut className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic page content */}
        <div className="flex-1 min-w-0 relative overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
