"use server";

import { redirect } from "next/navigation";
import { normalizeNickname } from "@/lib/picks/validation";
import { clearAppSession, setAppSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=Configure%20as%20variaveis%20do%20Supabase.");
  }

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const nickname = normalizeNickname(String(formData.get("nickname") ?? ""));

  if (!isValidEmail(email)) {
    redirect("/login?error=Informe%20um%20email%20valido.");
  }

  if (nickname.length < 2 || nickname.length > 30) {
    redirect("/login?error=Use%20um%20nickname%20de%202%20a%2030%20caracteres.");
  }

  const supabase = createAdminClient();
  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("id,nickname")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    redirect(`/login?error=${encodeURIComponent(existingError.message)}`);
  }

  if (existingProfile) {
    if (existingProfile.nickname !== nickname) {
      const { error: updateError } = await supabase.from("profiles").update({ nickname }).eq("id", existingProfile.id);

      if (updateError) {
        const message = updateError.code === "23505" ? "Nickname ja esta em uso." : updateError.message;
        redirect(`/login?error=${encodeURIComponent(message)}`);
      }
    }

    setAppSession(existingProfile.id);
    redirect("/picks");
  }

  const { data: createdProfile, error } = await supabase
    .from("profiles")
    .insert([{ email, nickname }])
    .select("id")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Email ou nickname ja esta em uso." : error.message;
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  setAppSession(createdProfile.id);
  redirect("/picks");
}

export async function signOutAction() {
  clearAppSession();
  redirect("/");
}
