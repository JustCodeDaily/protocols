"use client";
import { useState } from "react";
import { HabitCard } from "./HabitCard";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function TourScreen() {
  const supabase = createClient();
  const router = useRouter();
  
  const initialCards = [
    { id: "1", title: "Tour 1/2", question: "Swipe this to Right for Yes", restrictSwipe: "left" },
    { id: "2", title: "Tour 2/2", question: "Swipe this to Left for No", restrictSwipe: "right" }
  ];
  const [deck, setDeck] = useState(initialCards);

  const handleSwipe = async (cardId, direction) => {
    const newDeck = deck.filter((c) => c.id !== cardId);
    setDeck(newDeck);
    
    if (newDeck.length === 0) {
      await supabase.auth.updateUser({
        data: { tour_completed: true }
      });
      router.refresh();
    }
  };

  if (deck.length === 0) {
    return <div className="flex h-full w-full items-center justify-center text-zinc-500">Loading...</div>;
  }

  const stack = [...deck].reverse();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="relative h-96 w-full max-w-sm">
        {stack.map((card, index) => {
          const isTop = index === stack.length - 1;
          return (
            <HabitCard
              key={card.id}
              habit={card}
              isTop={isTop}
              zIndex={index}
              onSwipe={(direction) => handleSwipe(card.id, direction)}
            />
          );
        })}
      </div>
    </div>
  );
}
