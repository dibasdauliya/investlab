"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "./lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!supabaseConfigured) {
      router.replace("/login");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  return null;
}
