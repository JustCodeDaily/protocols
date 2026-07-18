"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function WelcomeScreen() {
  const [name, setName] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) return;
  const { data, error } = await supabase.auth.updateUser({
      data: { display_name: name.trim() }
    });
    if (!error) {
      router.refresh();
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
          How do you like to be called?
        </h2>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mb-6 w-full rounded-lg border border-zinc-200 p-3 text-sm bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <button 
          onClick={handleSave}
          className="flex w-full items-center justify-center rounded-xl bg-zinc-900 p-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Save
        </button>
      </div>
    </div>
  );
}
