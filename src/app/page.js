import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect("/login");

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Signed in securely</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome to SwipeHabit</h1>
      </section>
    </main>
  );
}
