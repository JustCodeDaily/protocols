import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    redirect("/login");
  }
  const { data: habits } = await supabase.from("habits").select("*").eq("active", true);
  const { data: logs } = await supabase.from("habit_logs").select("*");
  return <main className="flex min-h-screen w-full flex-col bg-zinc-50 px-6 font-sans dark:bg-black">
      <AnalyticsDashboard habits={habits || []} logs={logs || []} />
    </main>;
}
