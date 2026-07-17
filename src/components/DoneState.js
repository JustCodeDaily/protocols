import { FiCheckCircle as CheckCircle2 } from "react-icons/fi";
import { format } from "date-fns";
export function DoneState() {
  const today = new Date();
  return <div className="flex h-full flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <CheckCircle2 className="mb-6 h-16 w-16 text-emerald-500 dark:text-emerald-400 opacity-90" strokeWidth={1.5} />
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        All Went Well for the Day
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
        {format(today, "EEEE, MMMM do")} — all done.
      </p>
    </div>;
}
