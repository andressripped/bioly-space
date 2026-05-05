import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Settings, LogOut, User } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] transition-colors duration-300">
      
      {/* Sidebar / Nav */}
      <div className="flex">
        <aside className="w-64 border-r border-[#eeeeee] dark:border-[#222] min-h-screen p-6 hidden md:block">
          <div className="text-2xl font-extrabold tracking-tighter mb-10">bioly.</div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#f9fafb] dark:bg-[#111] rounded-xl font-semibold text-[#111111] dark:text-white border border-[#eeeeee] dark:border-[#333]">
              <LayoutDashboard className="w-5 h-5" />
              Links
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors">
              <User className="w-5 h-5" />
              Perfil
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors">
              <Settings className="w-5 h-5" />
              Ajustes
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-serif mb-2">Bienvenido, {user.user_metadata?.username || user.email?.split('@')[0]}</h1>
              <p className="text-[#555555] dark:text-[#a1a1aa]">Aquí es donde empieza la magia de tu universo digital.</p>
            </div>
            
            <Link href="/auth/signout" className="p-3 border border-[#eeeeee] dark:border-[#222] rounded-full hover:bg-gray-100 dark:hover:bg-[#111] transition-colors">
              <LogOut className="w-5 h-5" />
            </Link>
          </header>

          {/* Dashboard Content Mockup */}
          <div className="grid gap-6">
            <div className="p-12 border-2 border-dashed border-[#eeeeee] dark:border-[#222] rounded-3xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#f9fafb] dark:bg-[#111] rounded-2xl flex items-center justify-center mb-6 border border-[#eeeeee] dark:border-[#333]">
                <LayoutDashboard className="w-8 h-8 text-[#999999]" />
              </div>
              <h2 className="text-2xl font-serif mb-3">Aún no tienes enlaces</h2>
              <p className="text-[#555555] dark:text-[#a1a1aa] mb-8 max-w-sm">Añade tu primer enlace para que el mundo pueda ver lo que haces.</p>
              <button className="bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                + Añadir nuevo enlace
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
