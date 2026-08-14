import Link from "next/link";
import { PiGear, PiArrowLeft, PiCreditCard, PiBell, PiShield, PiSignOut, PiList, PiUser } from "react-icons/pi";
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
    <div className="w-full h-full overflow-y-auto bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5]">
      {/* Main Content */}
      <main className="p-6 md:p-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard/profile" className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors md:hidden cursor-pointer">
            <PiArrowLeft className="w-5 h-5" />
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
                <PiCreditCard className="w-6 h-6 text-white dark:text-black" />
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
              <button className="bg-[#111111] dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                Mejorar Plan
              </button>
            </div>
          </div>

          {/* Cuenta */}
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-[#222] rounded-2xl flex items-center justify-center">
                <PiShield className="w-6 h-6 text-[#555555] dark:text-[#a1a1aa]" />
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
                <Link href="/dashboard/profile" className="text-sm font-semibold text-[#555555] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer">
                  Cambiar
                </Link>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-[#222] rounded-2xl flex items-center justify-center">
                <PiBell className="w-6 h-6 text-[#555555] dark:text-[#a1a1aa]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notificaciones</h2>
                <p className="text-[#555555] dark:text-[#a1a1aa] text-sm">Próximamente</p>
              </div>
            </div>
            <p className="text-sm text-[#999999] italic">Las preferencias de notificaciones estarán disponibles pronto.</p>
          </div>

          {/* Sesión */}
          <div className="border border-[#eeeeee] dark:border-[#222] rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-2">Sesión</h2>
            <p className="text-sm text-[#555555] dark:text-[#a1a1aa] mb-6">Cierra sesión en este dispositivo.</p>
            <Link
              href="/auth/signout"
              className="inline-flex items-center gap-2 border border-[#eeeeee] dark:border-[#333] px-5 py-3 rounded-xl text-sm font-semibold text-[#555555] dark:text-[#a1a1aa] hover:border-[#111] hover:text-[#111111] dark:hover:border-white dark:hover:text-white transition-all cursor-pointer"
            >
              <PiSignOut className="w-4 h-4" />
              Cerrar sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
