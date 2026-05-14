import Link from "next/link";
import { Settings, ArrowLeft, CreditCard, Bell, Shield, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, plan")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#eeeeee] dark:border-[#222] min-h-screen p-6 hidden md:block">
        <div className="text-2xl font-extrabold tracking-tighter mb-10">bioly.</div>
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Links
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Perfil
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 bg-[#f9fafb] dark:bg-[#111] rounded-xl font-semibold text-[#111111] dark:text-white border border-[#eeeeee] dark:border-[#333]">
            <Settings className="w-5 h-5" />
            Ajustes
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-3xl">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-serif mb-1">Ajustes</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm">Gestiona tu cuenta y preferencias</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Plan actual */}
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#111111] dark:bg-white rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Plan actual</h2>
                <p className="text-[#555555] dark:text-[#a1a1aa] text-sm">Tu suscripción activa</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222]">
              <div>
                <p className="font-bold text-lg capitalize">{profile?.plan || "Free"}</p>
                <p className="text-sm text-[#555555] dark:text-[#a1a1aa]">
                  {profile?.plan === "free" || !profile?.plan ? "Gratis para siempre" : "Activo"}
                </p>
              </div>
              <button className="bg-[#111111] dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Mejorar Plan
              </button>
            </div>
          </div>

          {/* Cuenta */}
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-[#222] rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#555555] dark:text-[#a1a1aa]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Cuenta</h2>
                <p className="text-[#555555] dark:text-[#a1a1aa] text-sm">Información de tu cuenta</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-0.5">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-0.5">Username</p>
                  <p className="font-medium">bioly.space/{profile?.username || "—"}</p>
                </div>
                <Link href="/dashboard/profile" className="text-sm font-semibold text-[#555555] hover:text-[#111111] dark:hover:text-white transition-colors">
                  Cambiar
                </Link>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-[#222] rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#555555] dark:text-[#a1a1aa]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notificaciones</h2>
                <p className="text-[#555555] dark:text-[#a1a1aa] text-sm">Próximamente</p>
              </div>
            </div>
            <p className="text-sm text-[#999999] italic">Las preferencias de notificaciones estarán disponibles pronto.</p>
          </div>

          {/* Zona de peligro */}
          <div className="border border-red-200 dark:border-red-900/30 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">Zona de peligro</h2>
            <p className="text-sm text-[#555555] dark:text-[#a1a1aa] mb-6">Estas acciones son irreversibles. Procede con cuidado.</p>
            <Link
              href="/auth/signout"
              className="inline-flex items-center gap-2 border border-[#eeeeee] dark:border-[#333] px-5 py-3 rounded-xl text-sm font-semibold text-[#555555] dark:text-[#a1a1aa] hover:border-red-300 hover:text-red-500 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
