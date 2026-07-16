"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setError("");
    const { error: signInError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signInError) setError(signInError.message);
  }

  return (
    <div className="mt-8">
      <button className="w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white dark:bg-white dark:text-zinc-900" onClick={signInWithGoogle} type="button">
        Continue with Google
      </button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
