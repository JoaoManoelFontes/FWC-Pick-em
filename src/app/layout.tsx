import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { signOutAction } from "@/actions/auth";

export const metadata: Metadata = {
  title: "Bolao Pick'em Copa",
  description: "Pick'em casual da Copa do Mundo entre amigos."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = hasSupabaseEnv() ? createClient() : null;
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b border-slate-800 bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-sm font-black uppercase tracking-wide text-slate-100">
              Bolao Pick&apos;em Copa
            </Link>
            <nav className="flex items-center gap-2 text-sm text-slate-300">
              <Link className="rounded-xl px-3 py-2 hover:bg-slate-800 hover:text-sky-300" href="/picks">
                Picks
              </Link>
              <Link className="rounded-xl px-3 py-2 text-slate-500" href="/ranking">
                Ranking
              </Link>
              {user ? (
                <>
                  <Link className="rounded-xl px-3 py-2 hover:bg-slate-800 hover:text-sky-300" href="/profile">
                    Perfil
                  </Link>
                  <form action={signOutAction}>
                    <button className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 hover:bg-slate-800">
                      Sair
                    </button>
                  </form>
                </>
              ) : (
                <Link className="rounded-xl bg-sky-500 px-3 py-2 font-bold text-slate-950 hover:bg-sky-400" href="/login">
                  Entrar
                </Link>
              )}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
