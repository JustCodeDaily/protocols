"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaMicrosoft } from "react-icons/fa";

export function SignInButtons() {
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setError("");
    const { error: signInError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (signInError) setError(signInError.message);
  }

  async function signInWithGithub() {
    // Placeholder function for Github login
    setError("");
    console.log("GitHub sign in not yet fully implemented.");
  }

  async function signInWithMicrosoft() {
    // Placeholder function for Microsoft login
    setError("");
    console.log("Microsoft sign in not yet fully implemented.");
  }

  return (
    <div className="mt-8">
      <div className="flex flex-row justify-center items-center gap-6">
        <button 
          className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          onClick={signInWithGoogle} 
          type="button"
          aria-label="Continue with Google"
        >
          <FcGoogle className="w-6 h-6" />
        </button>
        <button 
          className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          onClick={signInWithGithub} 
          type="button"
          aria-label="Continue with GitHub"
        >
          <FaGithub className="w-7 h-7 text-zinc-900 dark:text-zinc-100" />
        </button>
        <button 
          className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          onClick={signInWithMicrosoft} 
          type="button"
          aria-label="Continue with Microsoft"
        >
          <FaMicrosoft className="w-6 h-6 text-[#00a4ef]" />
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-red-600 text-center">{error}</p> : null}
    </div>
  );
}
