"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { initTheme } from "../lib/theme";
import { FcGoogle } from "react-icons/fc";
import { TrendingUp, Mail, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim()) return setError("Email is required");

    setSending(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);

    otpError ? setError(otpError.message) : setNotice("Magic link sent!");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-accent-2/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent-2/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] rounded-[2.5rem] border border-border bg-card/80 p-8 backdrop-blur-3xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-2 shadow-[0_0_30px_rgba(101,61,126,0.5)] dark:shadow-[0_0_30px_rgba(101,61,126,0.5)]">
              <TrendingUp className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">InvestLab</h1>
            <p className="mt-2 text-sm text-muted">Trading intelligence for the next gen.</p>
          </div>

          <div className="space-y-4">
            {/* Google Login */}
            <button
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-card border border-border py-3.5 text-sm font-bold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-input-bg"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-grow bg-border" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Secure Link</span>
              <div className="h-[1px] flex-grow bg-border" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmail} className="space-y-3">
              <div className="group relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent-2 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-border bg-input-bg pl-12 pr-4 text-sm text-foreground outline-none ring-accent-2/20 transition-all focus:bg-card focus:ring-4 placeholder:text-muted"
                />
              </div>
              <button
                disabled={sending}
                className="group relative h-14 w-full overflow-hidden rounded-2xl bg-accent-2 font-bold text-white transition-all hover:opacity-90"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {sending ? "Processing..." : "Get Access"}{" "}
                  <Zap size={16} fill="currentColor" />
                </span>
              </button>
            </form>

            {/* Feedback Messages */}
            {notice && (
              <p className="text-center text-xs font-medium text-emerald-400 animate-in fade-in zoom-in duration-300">
                {notice}
              </p>
            )}
            {error && (
              <p className="text-center text-xs font-medium text-red-400 animate-in fade-in zoom-in duration-300">
                {error}
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}