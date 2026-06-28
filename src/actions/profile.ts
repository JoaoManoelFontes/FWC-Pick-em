"use server";

import { redirect } from "next/navigation";
import { getSafeNextRoute } from "@/lib/auth/redirects";
import { getAppSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeNickname } from "@/lib/picks/validation";

export async function saveProfileAction(formData: FormData) {
  const nickname = normalizeNickname(String(formData.get("nickname") ?? ""));
  const next = getSafeNextRoute(formData.get("next"), "/picks");

  if (!nickname) {
    redirect(`/profile?next=${encodeURIComponent(next)}&error=Nickname%20obrigatorio.`);
  }

  if (nickname.length < 2 || nickname.length > 30) {
    redirect(`/profile?next=${encodeURIComponent(next)}&error=Use%20um%20nickname%20de%202%20a%2030%20caracteres.`);
  }

  const session = getAppSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ nickname }).eq("id", session.userId);

  if (error) {
    const message = error.code === "23505" ? "Nickname ja esta em uso." : error.message;
    redirect(`/profile?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`);
  }

  redirect(next);
}
