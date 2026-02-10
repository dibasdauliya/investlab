 "use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import Topbar from "@/app/components/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

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
