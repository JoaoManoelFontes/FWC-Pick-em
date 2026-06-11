"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPicksLockedAt, isPicksLocked } from "@/lib/picks/deadline";
import { validatePickShape } from "@/lib/picks/validation";
import type { PickInput } from "@/types/picks";

export type SubmitPicksResult = {
  ok: boolean;
  message: string;
};

export async function submitPicksAction(picks: PickInput[]): Promise<SubmitPicksResult> {
  const session = getAppSession();

  if (!session) {
    return { ok: false, message: "Faca login para enviar seus picks." };
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", session.userId).maybeSingle();

  if (!profile) {
    return { ok: false, message: "Crie um nickname antes de enviar seus picks." };
  }

  if (isPicksLocked()) {
    return { ok: false, message: "Picks bloqueados. O prazo de envio ja passou." };
  }

  const { data: existingSubmission } = await supabase
    .from("pick_submissions")
    .select("id")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (existingSubmission) {
    return { ok: false, message: "Voce ja enviou seus picks." };
  }

  const shapeValidation = validatePickShape(picks);
  if (!shapeValidation.ok) {
    return { ok: false, message: shapeValidation.message };
  }

  const teamIds = picks.map((pick) => pick.teamId);
  const { data: teams, error: teamsError } = await supabase.from("teams").select("id").in("id", teamIds);

  if (teamsError) {
    return { ok: false, message: teamsError.message };
  }

  if ((teams ?? []).length !== teamIds.length) {
    return { ok: false, message: "Existe uma selecao invalida nos picks." };
  }

  const { error } = await supabase.rpc("submit_user_picks", {
    submitted_picks: picks,
    locked_at: getPicksLockedAt().toISOString(),
    profile_id: session.userId
  } as never);

  if (error) {
    const duplicate = error.message.toLowerCase().includes("duplicate") || error.message.includes("ja enviou");
    return {
      ok: false,
      message: duplicate ? "Voce ja enviou seus picks." : error.message
    };
  }

  revalidatePath("/picks");
  return { ok: true, message: "Picks enviados. Agora e torcer." };
}
