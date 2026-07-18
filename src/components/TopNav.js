"use client";
import Link from "next/link";
import { FiEdit as PenSquare, FiMoon as Moon, FiSun as Sun, FiBarChart2 as BarChart2, FiHome as Home, FiLogOut as LogOut } from "react-icons/fi";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TopNav() {
  const [theme, setTheme] = useState("light")
  const [user, setUser] = useState(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient();

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
    
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [])

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return <nav className="flex w-full items-center justify-center gap-8 py-4 bg-transparent absolute top-0 left-0 right-0 z-50">
      {pathname !== "/" && (
        <Link href="/" className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <Home className="h-6 w-6" />
        </Link>
      )}

      <Link href="/questions" className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        <PenSquare className="h-6 w-6" />
      </Link>
      
      <button onClick={toggleTheme} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
      </button>

      <Link href="/analytics" className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        <BarChart2 className="h-6 w-6" />
      </Link>

      {user && (
        <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <LogOut className="h-6 w-6" />
        </button>
      )}
    </nav>
}
