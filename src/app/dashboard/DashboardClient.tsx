"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, User, Settings, LogOut, Plus, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { AddLinkModal } from "./AddLinkModal";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { PlatformIcon } from "@/components/PlatformIcon";

export default function DashboardClient({ initialUser }: { initialUser: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", initialUser.id)
      .order("position", { ascending: true });

    if (!error) {
      setLinks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este enlace?")) return;
    
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (!error) {
      setLinks(links.filter(l => l.id !== id));
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
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
            <h1 className="text-4xl font-serif mb-2">Bienvenido, {initialUser.user_metadata?.username || initialUser.email?.split('@')[0]}</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa]">Aquí es donde empieza la magia de tu universo digital.</p>
          </div>
          
          <Link href="/auth/signout" className="p-3 border border-[#eeeeee] dark:border-[#222] rounded-full hover:bg-gray-100 dark:hover:bg-[#111] transition-colors">
            <LogOut className="w-5 h-5" />
          </Link>
        </header>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Tus enlaces</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Añadir enlace
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222]" />
            ))}
          </div>
        ) : links.length > 0 ? (
          <div className="grid gap-4">
            {links.map((link) => (
              <div 
                key={link.id} 
                className="group flex items-center gap-4 bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] p-4 rounded-2xl hover:border-[#111111] dark:hover:border-white transition-all shadow-sm"
              >
                <div className="w-12 h-12 bg-[#f9fafb] dark:bg-[#111] rounded-xl flex items-center justify-center border border-[#eeeeee] dark:border-[#222]">
                  <PlatformIcon id={link.icon} className="w-6 h-6 text-[#111111] dark:text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-[#111111] dark:text-white">{link.title}</h3>
                  <p className="text-xs text-[#999999] truncate max-w-[150px] md:max-w-md">{link.url}</p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-[#555555] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={() => handleDelete(link.id)}
                    className="p-2 text-[#555555] dark:text-[#a1a1aa] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-[#eeeeee] dark:border-[#222] rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#f9fafb] dark:bg-[#111] rounded-2xl flex items-center justify-center mb-6 border border-[#eeeeee] dark:border-[#333]">
              <LayoutDashboard className="w-8 h-8 text-[#999999]" />
            </div>
            <h2 className="text-2xl font-serif mb-3">Aún no tienes enlaces</h2>
            <p className="text-[#555555] dark:text-[#a1a1aa] mb-8 max-w-sm">Añade tu primer enlace para que el mundo pueda ver lo que haces.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              + Añadir nuevo enlace
            </button>
          </div>
        )}
      </main>

      <AddLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchLinks}
      />
    </div>
  );
}
