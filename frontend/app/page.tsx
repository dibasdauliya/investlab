"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { FaGoogle } from "react-icons/fa";

const features = [
  "Portfolio snapshots and weekly performance emails",
  "Research notes with tagged market themes",
  "Collaborative watchlists for your team",
  "Private data rooms for investment memos",
];

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const displayName = useMemo(() => {
    if (!session?.user) return "";
    const metadata = session.user.user_metadata ?? {};
    return (
      metadata.full_name ||
      metadata.name ||
      metadata.preferred_username ||
      session.user.email?.split("@")[0] ||
      "Investor"
    );
  }, [session]);

  const handleGoogle = async () => {
    setError("");
    setNotice("");
    if (!supabase) return;

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (signInError) {
      setError(signInError.message);
    }
  };

  const handleEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!supabase) return;

    if (!email.trim()) {
      setError("Enter an email address to continue.");
      return;
    }

    setSending(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setSending(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setNotice("Magic link sent. Check your inbox to finish signing in.");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Loading session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(240,122,63,0.55)_0%,_rgba(11,11,16,0)_70%)] blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(77,212,198,0.4)_0%,_rgba(11,11,16,0)_70%)] blur-3xl" />
        <div className="absolute bottom-[-30%] left-1/3 h-[520px] w-[520px] animate-[floaty_6s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_rgba(11,11,16,0)_70%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center">
        <section className="flex w-full flex-col gap-8 lg:w-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted">
            InvestLab
          </div>
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            The private cockpit for modern investment teams.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
            Securely access research, portfolio insights, and deal workflows in
            one place. Sign in with Google or request a magic link to continue.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-muted"
              >
                {feature}
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.01))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur lg:w-1/2">
          {supabase === null ? (
            <div className="flex flex-col gap-4 text-sm text-muted">
              <h2 className="text-lg text-foreground">
                Supabase not configured
              </h2>
              <p>
                Add{" "}
                <span className="text-foreground">
                  NEXT_PUBLIC_SUPABASE_URL
                </span>{" "}
                and{" "}
                <span className="text-foreground">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </span>{" "}
                to your environment to enable login.
              </p>
            </div>
          ) : session ? (
            <div className="flex flex-col gap-6 animate-[rise_0.6s_ease-out]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    Signed in
                  </p>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Welcome back, {displayName}
                  </h2>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted transition hover:border-white/30 hover:text-foreground"
                >
                  Sign out
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Active workspace
                </p>
                <p className="mt-3 text-lg text-foreground">
                  Northwind Capital
                </p>
                <p className="mt-2 text-sm text-muted">
                  Last sync: 2 minutes ago · 14 new filings reviewed
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    Task queue
                  </p>
                  <p className="mt-3 text-2xl text-foreground">6</p>
                  <p className="mt-2 text-sm text-muted">
                    Memo drafts waiting for review
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    AUM tracked
                  </p>
                  <p className="mt-3 text-2xl text-foreground">$2.4B</p>
                  <p className="mt-2 text-sm text-muted">
                    Across 18 active vehicles
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-[rise_0.6s_ease-out]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Secure access
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  Sign in to your workspace
                </h2>
              </div>

              <button
                onClick={handleGoogle}
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-foreground transition hover:border-white/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                  <FaGoogle size={14} />
                </span>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-muted">
                <span className="h-px flex-1 bg-white/10" />
                or email
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleEmail} className="flex flex-col gap-4">
                <label className="text-xs uppercase tracking-[0.3em] text-muted">
                  Work email
                </label>
                <input
                  type="email"
                  placeholder="you@firm.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 rounded-2xl border border-white/15 bg-black/30 px-4 text-sm text-foreground outline-none transition focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sending ? "Sending magic link..." : "Email me a magic link"}
                </button>
              </form>

              {(notice || error) && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    error
                      ? "border-red-500/40 bg-red-500/10 text-red-200"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  }`}
                >
                  {error || notice}
                </div>
              )}

              <p className="text-xs leading-6 text-muted">
                By continuing, you agree to InvestLab&apos;s security policy and
                acknowledge that your access is monitored.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
