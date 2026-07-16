import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const { error } = await (await createClient()).auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("error", "Unable to complete Google sign-in.");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
