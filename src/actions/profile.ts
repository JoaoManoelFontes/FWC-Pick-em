"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeNickname } from "@/lib/picks/validation";

export async function saveProfileAction(formData: FormData) {
  const nickname = normalizeNickname(String(formData.get("nickname") ?? ""));

  if (!nickname) {
    redirect("/profile?error=Nickname%20obrigatorio.");
  }

  if (nickname.length < 2 || nickname.length > 30) {
    redirect("/profile?error=Use%20um%20nickname%20de%202%20a%2030%20caracteres.");
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("profiles").upsert([
    {
      id: user.id,
      nickname,
      email: user.email ?? null
    }
  ] as never[]);

  if (error) {
    const message = error.code === "23505" ? "Nickname ja esta em uso." : error.message;
    redirect(`/profile?error=${encodeURIComponent(message)}`);
  }

  redirect("/picks");
}
