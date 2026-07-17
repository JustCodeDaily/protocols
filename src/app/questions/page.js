import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionsList } from "@/components/QuestionsList";
export default async function QuestionsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    redirect("/login");
  }
  const userId = authData.user.id;
  const { data: habits } = await supabase.from("habits").select("*").eq("active", true).order("sort_order", { ascending: true });
  return <main className="flex min-h-screen w-full flex-col bg-zinc-50 px-6 font-sans dark:bg-black">
      <QuestionsList initialHabits={habits || []} userId={userId} />
    </main>;
}
