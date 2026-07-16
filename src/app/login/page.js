import { GoogleSignInButton } from "./google-sign-in-button";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">SwipeHabit</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build better days.</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">Sign in to keep your habits private and in sync.</p>
        <GoogleSignInButton />
      </section>
    </main>
  );
}
