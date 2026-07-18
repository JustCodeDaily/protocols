"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FcGoogle } from "react-icons/fc";

export function SignInButtons() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("namastedev@example.com");
  const [password, setPassword] = useState("namasteDev");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function signInWithGoogle() {
    setError("");
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (signInError) setError(signInError.message);
  }

  async function signInWithEmail(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    let { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Auto sign-up if user doesn't exist for easy testing
    if (signInError && signInError.message.includes("Invalid login credentials")) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: "namasteDev", tour_completed: true } }
      });
      if (!signUpError) {
        signInError = null;
      } else {
        signInError = signUpError;
      }
    }

    if (signInError) {
      setError(signInError.message);
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <form onSubmit={signInWithEmail} className="flex flex-col gap-3">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-zinc-200 p-3 text-sm bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
          readOnly
          required
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-zinc-200 p-3 text-sm bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
          readOnly
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-zinc-900 p-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500 mt-2">
        Use test user to explore the app with mock data.
      </p>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        <span className="flex-shrink-0 mx-4 text-xs text-zinc-400 uppercase">Or</span>
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
      </div>

      <div className="flex flex-row justify-center items-center gap-6">
        <button 
          className="flex h-14 w-[100%] items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors shadow-sm gap-3"
          onClick={signInWithGoogle} 
          type="button"
          aria-label="Continue with Google"
        >
          <FcGoogle className="w-6 h-6" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Continue with Google</span>
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
