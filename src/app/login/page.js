import { SignInButtons } from "./sign-in-buttons";
export default function LoginPage() {
  return <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Protocols</h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">Yes. No. Repeat. That's it.</p>
        </div>
        <SignInButtons />
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">Sign in to keep your habits private and in sync.</p>
      </section>
    </main>;
}
