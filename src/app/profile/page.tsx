import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveProfileAction } from "@/actions/profile";
import { getSafeNextRoute } from "@/lib/auth/redirects";
import { getAppSession } from "@/lib/auth/session";

export default async function ProfilePage({
  searchParams
}: {
  searchParams: { error?: string; saved?: string; next?: string };
}) {
  const session = getAppSession();
  const next = getSafeNextRoute(searchParams.next, "/picks");

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const supabase = createAdminClient();
  const { data: profileData } = await supabase.from("profiles").select("email,nickname").eq("id", session.userId).maybeSingle();
  const profile = profileData as { email: string; nickname: string } | null;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h1 className="text-2xl font-black uppercase text-slate-50">Nickname</h1>
        <p className="mt-2 text-sm text-slate-400">
          Esse sera seu nome publico no bolao{profile?.email ? ` (${profile.email})` : ""}.
        </p>
        <form action={saveProfileAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm font-bold text-slate-200" htmlFor="nickname">
            Nickname
          </label>
          <input
            id="nickname"
            name="nickname"
            required
            minLength={2}
            maxLength={30}
            defaultValue={profile?.nickname ?? ""}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            placeholder="Seu nick"
          />
          <button className="w-full rounded-xl bg-sky-500 px-5 py-3 font-bold text-slate-950 hover:bg-sky-400">
            Salvar nickname
          </button>
        </form>
        {searchParams.error ? (
          <p className="mt-4 rounded-xl border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
            {searchParams.error}
          </p>
        ) : null}
        {searchParams.saved ? (
          <p className="mt-4 rounded-xl border border-green-700 bg-green-950/40 p-3 text-sm text-green-300">
            Nickname salvo.
          </p>
        ) : null}
      </section>
    </main>
  );
}
