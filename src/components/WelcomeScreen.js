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
    
    // Get the current user reliably
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { display_name: name.trim() }
    });

    if (!updateError) {
      const defaultHabits = [
        { user_id: user.id, title: 'Morning Routine', question: 'Did you wake up by 5:30 AM?', sort_order: 1 },
        { user_id: user.id, title: 'Hydration', question: 'Did you drink 3L of Water every day?', sort_order: 2 },
        { user_id: user.id, title: 'Diet', question: 'Did you do 3 Meals a Day?', sort_order: 3 },
        { user_id: user.id, title: 'Digital Detox', question: 'Was your screentime < 3 Hours today?', sort_order: 4 },
        { user_id: user.id, title: 'Sleep', question: 'Did you hit bed by 11PM?', sort_order: 5 }
      ];
      
      // Try to insert the habits
      const { error: insertError } = await supabase.from('habits').insert(defaultHabits);
      
      // If it fails (e.g. RLS issues), log it to the console so we can debug
      if (insertError) {
        console.error("Failed to insert default habits:", insertError);
      }

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
