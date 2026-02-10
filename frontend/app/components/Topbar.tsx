"use client";

import { Sun, Moon, Bell, ChevronDown, ShieldAlert, UserCog, Trash2, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { toggleTheme, initTheme } from "../lib/theme";

export default function Topbar({ user }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [marketStatus, setMarketStatus] = useState("CLOSED");
  const [statusColor, setStatusColor] = useState("bg-red-500");

  // Initialize theme and mount component
  useEffect(() => {
    initTheme();
    setMounted(true);
    updateMarketStatus();
    
    // Update market status every minute
    const interval = setInterval(updateMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateMarketStatus = () => {
    const now = new Date();
    
    // US markets operate Monday-Friday, 9:30 AM - 4:00 PM EST
    const dayOfWeek = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Check if it's a weekday (1-5 = Monday-Friday)
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    
    // Convert to EST (UTC-5, or UTC-4 during DST)
    // For simplicity, we'll assume EST year-round or use system time
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const estHours = estTime.getHours();
    const estMinutes = estTime.getMinutes();
    
    // Market open: 9:30 AM - 4:00 PM EST
    const isOpen = isWeekday && 
                   (estHours > 9 || (estHours === 9 && estMinutes >= 30)) && 
                   estHours < 16;
    
    if (isOpen) {
      setMarketStatus("MARKET OPEN");
      setStatusColor("bg-emerald-500");
    } else {
      setMarketStatus("MARKET CLOSED");
      setStatusColor("bg-red-500");
    }
  };

  // Format Date: e.g., FEB . 09 . 2026
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dateParts = now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).toUpperCase().replace(/,/g, "").split(" ");

  const avatar = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || "InvestLab Trader";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between px-8 bg-card/80 backdrop-blur-md border-b border-border">
      {/* Left Side: Creative Market Clock */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${statusColor} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]`} />
          <h1 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
            {marketStatus} / <span className="text-foreground">{dayName}</span>
          </h1>
        </div>
        {mounted && (
          <p className="text-xs font-mono font-bold text-accent-2 tracking-tighter">
            {dateParts[0]} <span className="text-muted">.</span> {dateParts[1]} <span className="text-muted">.</span> {dateParts[2]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Functional Theme Toggle using lib/theme */}
        <button
          onClick={toggleTheme}
          className="group h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card text-muted hover:text-accent-2 transition-all hover:bg-card/80"
        >
          {/* Sun shows in Light mode, Moon shows in Dark mode */}
          <Sun size={18} className="block dark:hidden transition-transform group-hover:rotate-45" />
          <Moon size={18} className="hidden dark:block transition-transform group-hover:-rotate-12" />
        </button>

        {/* Notifications */}
        <button className="text-muted hover:text-foreground transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-accent rounded-full border-2 border-card" />
        </button>

        <div className="h-6 w-[1px] bg-border" />

        {/* Profile Dropdown */}
        <div 
          className="relative"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <motion.div 
            className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl cursor-pointer transition-all ${isOpen ? 'bg-card shadow-inner' : ''}`}
          >
            <div className="relative">
              <img
                src={avatar} 
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-xl border border-border object-cover grayscale-[20%] hover:grayscale-0 transition-all"
                alt="Profile"
              />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-card flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-foreground leading-tight">{name}</p>
              <p className="text-[9px] font-black text-accent-2 uppercase tracking-widest">Pro Member</p>
            </div>
            <ChevronDown size={14} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </motion.div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-xl backdrop-blur-xl"
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Menu</p>
                </div>

                <button className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/90 hover:bg-accent-2/10 hover:text-accent-2 transition-all">
                  <UserCog size={16} className="text-muted group-hover:text-accent-2" />
                  <span className="font-medium">Modify Identity</span>
                </button>

                <button className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/90 hover:bg-card transition-all">
                  <ShieldAlert size={16} className="text-muted group-hover:text-amber-500" />
                  <span className="font-medium">Privacy Shield</span>
                </button>

                <div className="my-2 border-t border-border" />

                <button 
                  onClick={handleSignOut}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Power size={16} className="text-red-500/70" />
                  <span className="font-bold">Sign Out</span>
                </button>

                <button className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[9px] font-black text-muted hover:text-red-600 transition-all mt-1">
                  <Trash2 size={12} />
                  <span className="uppercase tracking-[0.1em]">Terminate Account</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}