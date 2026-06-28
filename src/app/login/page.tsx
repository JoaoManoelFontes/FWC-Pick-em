import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { getSafeNextRoute } from "@/lib/auth/redirects";
import { getAppSession } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; next?: string };
}) {
  const next = getSafeNextRoute(searchParams.next);

  if (getAppSession()) {
    redirect(next);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h1 className="text-2xl font-black uppercase text-slate-50">Entrar</h1>
        <p className="mt-2 text-sm text-slate-400">Informe email para entrar no bolao. Nickname e obrigatorio para email novo.</p>
        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm font-bold text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            placeholder="voce@email.com"
          />
          <label className="block text-sm font-bold text-slate-200" htmlFor="nickname">
            Nickname
          </label>
          <input
            id="nickname"
            name="nickname"
            minLength={2}
            maxLength={30}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            placeholder="Seu nick"
          />
          <button className="w-full rounded-xl bg-sky-500 px-5 py-3 font-bold text-slate-950 hover:bg-sky-400">
            Entrar
          </button>
        </form>
        {searchParams.error ? (
          <p className="mt-4 rounded-xl border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
            {searchParams.error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
