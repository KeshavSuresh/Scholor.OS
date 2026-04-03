"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Calendar, BookOpen, Trophy, Wrench, Brain, LogOut,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { AIFloatingButton } from "@/components/ai/AIFloatingButton";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/school", label: "School", icon: BookOpen },
  { href: "/extracurriculars", label: "Extracurriculars", icon: Trophy },
  { href: "/projects", label: "Projects", icon: Wrench },
  { href: "/ai", label: "Scholar AI", icon: Brain },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onboarded = useAppStore((s) => s.profile.onboarded);
  const logout = useAppStore((s) => s.logout);

  if (!onboarded) return <OnboardingWizard />;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[#2a2a35] bg-[#111118] fixed h-full z-40">
        <div className="px-5 py-6 border-b border-[#2a2a35]">
          <span className="font-syne font-bold text-xl tracking-tight text-white">
            Scholar<span className="text-[#7c6aff]">OS</span>
          </span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-[#18181f] text-white font-medium"
                      : "text-[#6b6b80] hover:text-white hover:bg-[#18181f]"
                  }`}
                >
                  <Icon size={16} className={active ? "text-[#7c6aff]" : ""} />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>
        <div className="px-2 py-4 border-t border-[#2a2a35]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#6b6b80] hover:text-[#ff6a5e] hover:bg-[#18181f] transition-colors w-full"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-h-screen">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom tab bar — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111118] border-t border-[#2a2a35] flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex-1">
              <div className={`flex flex-col items-center py-2 gap-0.5 text-[10px] transition-colors ${
                active ? "text-[#7c6aff]" : "text-[#6b6b80]"
              }`}>
                <Icon size={18} />
                <span className="truncate">{label.split(" ")[0]}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Floating AI button (hidden on AI page) */}
      {pathname !== "/ai" && <AIFloatingButton />}
    </div>
  );
}
