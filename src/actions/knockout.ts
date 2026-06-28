"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { getKnockoutPicksLockedAt, isKnockoutPicksLocked } from "@/lib/picks/deadline";
import { validateKnockoutPickShape } from "@/lib/knockout/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { KnockoutPickInput } from "@/types/knockout";

export type SubmitKnockoutPicksResult = {
  ok: boolean;
  message: string;
};

export async function submitKnockoutPicksAction(
  picks: KnockoutPickInput[]
): Promise<SubmitKnockoutPicksResult> {
  const session = getAppSession();

  if (!session) {
    return { ok: false, message: "Faca login para enviar sua chave." };
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase.from("profiles").select("id,nickname").eq("id", session.userId).maybeSingle();

  if (!profile) {
    return { ok: false, message: "Crie um nickname antes de enviar sua chave." };
  }

  if (isKnockoutPicksLocked()) {
    return { ok: false, message: "Picks do mata-mata bloqueados. O prazo de envio ja passou." };
  }

  const { data: existingSubmission } = await supabase
    .from("knockout_submissions")
    .select("id")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (existingSubmission) {
    return { ok: false, message: "Voce ja enviou seus picks do mata-mata." };
  }

  const shapeValidation = validateKnockoutPickShape(picks);
  if (!shapeValidation.ok) {
    return { ok: false, message: shapeValidation.message };
  }

  const { error } = await supabase.rpc("submit_knockout_picks", {
    submitted_picks: picks,
    locked_at: getKnockoutPicksLockedAt().toISOString(),
    profile_id: session.userId
  } as never);

  if (error) {
    const lowerMessage = error.message.toLowerCase();
    const duplicate = lowerMessage.includes("duplicate") || lowerMessage.includes("ja enviou");
    return {
      ok: false,
      message: duplicate ? "Voce ja enviou seus picks do mata-mata." : error.message
    };
  }

  revalidatePath("/mata-mata");
  return { ok: true, message: "Chave enviada. Agora e mata-mata." };
}
