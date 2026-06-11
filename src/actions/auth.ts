"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=Configure%20as%20variaveis%20do%20Supabase.");
  }

  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/login?error=Informe%20um%20email%20valido.");
  }

  const origin = headers().get("origin") ?? "http://localhost:3000";
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/picks`
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?sent=1");
}

export async function signOutAction() {
  if (hasSupabaseEnv()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
