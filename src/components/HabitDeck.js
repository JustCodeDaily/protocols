"use client";
import { useState } from "react";
import { HabitCard } from "./HabitCard";
import { DoneState } from "./DoneState";
import { FiChevronLeft as ChevronLeft, FiChevronRight as ChevronRight } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
export function HabitDeck({ initialHabits, userId, activeHabitsCount, userName }) {
  const supabase = createClient();
  const [deck, setDeck] = useState(initialHabits);
  const [answeredIds, setAnsweredIds] = useState(new Set());
  
  const visibleDeck = deck.filter((h) => !answeredIds.has(h.id));
  const handleSwipe = async (habitId, direction) => {
    setAnsweredIds((prev) => {
      const next = new Set(prev);
      next.add(habitId);
      return next;
    });

    const status = direction === "right";
    const logDate = format(new Date(), "yyyy-MM-dd");
    const { error } = await supabase.from("habit_logs").upsert(
      {
        user_id: userId,
        habit_id: habitId,
        log_date: logDate,
        status
      },
      { onConflict: "habit_id, log_date" }
    );
    if (error) {
      console.error("Failed to log habit:", error);
    }
  };
  const handleNext = () => {
    if (visibleDeck.length <= 1) return;
    const currentCard = visibleDeck[0];
    setDeck((prevDeck) => {
      const withoutCurrent = prevDeck.filter((h) => h.id !== currentCard.id);
      return [...withoutCurrent, currentCard];
    });
  };
  const handlePrev = () => {
    if (visibleDeck.length <= 1) return;
    const lastVisibleCard = visibleDeck[visibleDeck.length - 1];
    setDeck((prevDeck) => {
      const withoutLast = prevDeck.filter((h) => h.id !== lastVisibleCard.id);
      return [lastVisibleCard, ...withoutLast];
    });
  };
  if (visibleDeck.length === 0) {
    return <DoneState activeHabitsCount={activeHabitsCount} userName={userName} />;
  }
  const stack = [...visibleDeck].reverse();
  return <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="relative h-[345px] w-full max-w-sm">
        {stack.map((habit, index) => {
    const isTop = index === stack.length - 1;
    const answeredCount = activeHabitsCount - initialHabits.length;
    const originalIndex = answeredCount + initialHabits.findIndex(h => h.id === habit.id) + 1;
    const totalHabits = activeHabitsCount;
    return <HabitCard
      key={habit.id}
      habit={habit}
      isTop={isTop}
      zIndex={index}
      habitIndex={originalIndex}
      totalHabits={totalHabits}
      onSwipe={(direction) => handleSwipe(habit.id, direction)}
    />;
  })}
      </div>

      <div className="mt-12 flex gap-6">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handlePrev}
            className="rounded-full bg-zinc-100 p-4 text-zinc-500 transition-colors hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Previous question"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <span className="text-xs text-zinc-400 font-medium">Previous Habit</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleNext}
            className="rounded-full bg-zinc-100 p-4 text-zinc-500 transition-colors hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Next question"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <span className="text-xs text-zinc-400 font-medium">Next Habit</span>
        </div>
      </div>
    </div>;
}
