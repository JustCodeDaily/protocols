"use client";
import { FiCheckCircle as CheckCircle2 } from "react-icons/fi";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DoneState({ activeHabitsCount, userName }) {
  const [mounted, setMounted] = useState(false);
  const today = new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  if (activeHabitsCount === 0) {
    return <div className="flex h-full flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Hey, {userName}
      </h2>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">
        A bit of Habit is always goooooood!
      </p>
      <p className="mb-2 text-zinc-500 dark:text-zinc-400">
       Would you like to add some?
      </p>
      <Link 
        href="/questions"
        className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        Add Habit
      </Link>
    </div>;
  }

  return <div className="flex h-full flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <CheckCircle2 className="mb-6 h-16 w-16 text-emerald-500 dark:text-emerald-400 opacity-90" strokeWidth={1.5} />
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        All Went Well for the Day!
      </h2>
      <p className="mb-2 text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
        {format(today, "EEEE, MMMM do")} — all done.
      </p>
      <p className="mt-4 text-zinc-600 dark:text-zinc-300">
        You have a great Apetitie. Mind adding few more Habits.
      </p>
      <p className="mb-8 text-zinc-600 dark:text-zinc-300">
        A bit of Habit is always goooooood!
      </p>
      <Link 
        href="/questions"
        className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        Add Habit
      </Link>
    </div>;
}
