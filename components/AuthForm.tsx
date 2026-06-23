"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Mode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError("Please enter both your email and a password ✦");
      return;
    }
    if (isRegister && password.length < 6) {
      setError("Your secret spell must be at least 6 characters ✦");
      return;
    }

    setBusy(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // If email confirmation is ON, there's no active session yet.
        if (!data.session) {
          setNotice(
            "✦ Check your inbox to confirm your email, then return to sign in."
          );
        }
        // If confirmation is OFF, onAuthStateChange in AuthGate takes over.
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // success -> AuthGate's listener swaps to the board
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something disrupted the magic."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-6 text-center">
          <p className="font-script text-3xl text-blush-400">welcome to your</p>
          <h1 className="font-display text-5xl font-bold leading-none gilt-text">
            Enchanted Tasks
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-blush-500/80">
            A grimoire where every wish becomes a spell. Sign in to open yours. ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="paper animate-floatUp p-7">
          <div className="mb-5 text-center">
            <p className="font-script text-2xl text-blush-400">
              {isRegister ? "Begin your" : "Return to your"}
            </p>
            <h2 className="font-display text-3xl font-semibold text-blush-600">
              {isRegister ? "story" : "grimoire"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-magic" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input-magic"
                placeholder="you@enchanted.realm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label-magic" htmlFor="password">
                Secret spell (password)
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="input-magic"
                placeholder={isRegister ? "at least 6 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-xl bg-blush-100 px-4 py-2 text-sm text-blush-700">
                ⚠ {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl bg-gold-200/60 px-4 py-2 text-sm text-gold-600">
                {notice}
              </p>
            )}

            <button type="submit" className="btn-magic w-full" disabled={busy}>
              {busy
                ? "Casting…"
                : isRegister
                ? "✦ Begin your story"
                : "✦ Enter the grimoire"}
            </button>
          </div>

          <div className="mt-5 text-center text-sm text-blush-400">
            {isRegister ? "Already have a grimoire?" : "New to the realm?"}{" "}
            <button
              type="button"
              className="font-semibold text-blush-600 underline-offset-2 hover:underline"
              onClick={() => {
                setMode(isRegister ? "login" : "register");
                setError(null);
                setNotice(null);
              }}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-blush-300">
          spun with ✦ love, lace &amp; a little Supabase magic
        </p>
      </div>
    </div>
  );
}
