"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  TrendingUp,
  BookOpen,
  BarChart3,
  Wallet,
  Users,
  LogOut,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/market", label: "Market Indices", icon: BarChart3 },
  { href: "/planner", label: "Financial Planner", icon: Wallet },
  { href: "/community", label: "Community", icon: Users },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        return;
      }
      
      // Clear localStorage to remove any cached data
      localStorage.clear();
      
      // Replace current history entry and push a new one to break the back chain
      window.history.replaceState(null, "", "/login");
      
      // Then navigate
      router.replace("/login");
      
      // Push a dummy entry so back button stays on login
      window.history.pushState(null, "", "/login");
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <aside className="relative flex h-screen w-72 flex-col border-r border-border bg-card/80 backdrop-blur-xl p-6">
      {/* Logo Section */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-2 shadow-[0_0_20px_rgba(101,61,126,0.4)] dark:shadow-[0_0_20px_rgba(101,61,126,0.4)]">
          <TrendingUp className="text-white" size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tighter text-foreground">
          InvestLab
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
          MENU
        </p>
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = path === href;
          return (
            <Link key={href} href={href} className="relative group block">
              <div
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-muted hover:bg-card hover:text-foreground"
                }`}
              >
                {/* Active Glow Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-2xl bg-accent-2 shadow-[0_0_25px_rgba(101,61,126,0.3)] dark:shadow-[0_0_25px_rgba(101,61,126,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <Icon size={20} className="relative z-10" />
                <span className="relative z-10 font-bold text-sm tracking-tight">
                  {label}
                </span>

                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-4 z-10"
                  >
                    <Sparkles size={14} className="text-white/70" />
                  </motion.div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Pro Upgrade or Status */}
      <div className="mb-6 rounded-[2rem] border border-border bg-card/80 p-4 text-center">
        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Sparkles size={16} />
        </div>
        <p className="text-xs font-bold text-foreground">Pro Access</p>
        <p className="mt-1 text-[10px] text-muted">Global markets unlocked</p>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="group mt-auto flex items-center justify-between px-4 py-4 rounded-2xl border border-border bg-card/50 text-muted transition-all hover:bg-red-500/10 hover:text-red-400"
      >
        <div className="flex items-center gap-3">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Sign out</span>
        </div>
      </button>
    </aside>
  );
}