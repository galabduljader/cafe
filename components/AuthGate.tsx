"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "./AuthForm";
import TaskBoard from "./TaskBoard";

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <p className="animate-twinkle font-script text-2xl text-blush-300">
          ✦ unlocking the grimoire ✦
        </p>
      </div>
    );
  }

  if (!session) return <AuthForm />;

  return (
    <TaskBoard
      userEmail={session.user.email ?? "traveller"}
      onSignOut={signOut}
    />
  );
}
