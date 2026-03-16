"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import Topbar from "@/app/components/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!supabaseConfigured) {
      router.replace("/login");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  if (!session) return null;

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
