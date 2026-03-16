"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      const message = errorDescription?.replace(/\+/g, " ") ?? error;
      router.replace(`/login?error=${encodeURIComponent(message)}`);
      return;
    }

    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchError }) => {
        router.replace(exchError ? `/login?error=${encodeURIComponent(exchError.message)}` : "/dashboard");
      });
      return;
    }

    // Implicit flow — tokens arrive in URL hash; Supabase client handles them automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
        return;
      }
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          sub.subscription.unsubscribe();
          router.replace("/dashboard");
        }
      });
      const timeout = setTimeout(() => {
        sub.subscription.unsubscribe();
        router.replace("/login");
      }, 3000);
      return () => {
        clearTimeout(timeout);
        sub.subscription.unsubscribe();
      };
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted text-sm">Signing you in…</p>
    </div>
  );
}
