import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HabitDeck } from "@/components/HabitDeck";
import { format } from "date-fns";
export default async function Home() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    redirect("/login");
  }
  const userId = authData.user.id;
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: habits } = await supabase.from("habits").select("*").eq("active", true).order("sort_order", { ascending: true });
  const { data: logs } = await supabase.from("habit_logs").select("habit_id").eq("log_date", today);
  const activeHabits = habits || [];
  const loggedHabitIds = new Set(logs?.map((l) => l.habit_id) || []);
  const unansweredHabits = activeHabits.filter((h) => !loggedHabitIds.has(h.id));
  return <main className="flex h-screen w-full flex-col overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <div className="flex-1 p-6 relative">
        <HabitDeck initialHabits={unansweredHabits} userId={userId} />
      </div>
    </main>;
}
