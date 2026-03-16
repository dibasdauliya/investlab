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

    // Check existing session first
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
        return;
      }
      // No session yet — listen for auth state change (handles magic link implicit flow)
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          sub.subscription.unsubscribe();
          router.replace("/dashboard");
        } else if (event === "SIGNED_OUT") {
          sub.subscription.unsubscribe();
          router.replace("/login");
        }
      });
      // Fallback: if no auth event fires quickly, send to login
      const timeout = setTimeout(() => {
        sub.subscription.unsubscribe();
        router.replace("/login");
      }, 2000);
      return () => {
        clearTimeout(timeout);
        sub.subscription.unsubscribe();
      };
    });
  }, [router]);

  return null;
}
