"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, User, Settings, LogOut, Plus, ExternalLink, Trash2, Menu, X, GripVertical, BarChart2
} from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddLinkModal } from "./AddLinkModal";
import { createClient } from "@/utils/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";

// ─── Sortable Link Item ───────────────────────────────────────────────────────
function SortableLinkItem({
  link,
  onDelete,
}: {
  link: any;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] p-4 rounded-2xl transition-all shadow-sm ${
        isDragging
          ? "opacity-50 border-[#111111] dark:border-white shadow-2xl scale-[1.02] z-50"
          : "hover:border-[#d0d0d0] dark:hover:border-[#444]"
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1.5 text-[#cccccc] dark:text-[#444] hover:text-[#111111] dark:hover:text-white transition-colors cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        aria-label="Arrastrar para ordenar"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Icon */}
      <div className="w-11 h-11 bg-[#f9fafb] dark:bg-[#111] rounded-xl flex items-center justify-center border border-[#eeeeee] dark:border-[#222] flex-shrink-0">
        <PlatformIcon id={link.icon} className="w-5 h-5 text-[#111111] dark:text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[#111111] dark:text-white truncate text-sm">{link.title}</h3>
        <p className="text-xs text-[#999999] truncate">{link.url}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-[#555555] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={() => onDelete(link.id)}
          className="p-2 text-[#555555] dark:text-[#a1a1aa] hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardClient({ initialUser }: { initialUser: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // Require 8px movement to start drag
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", initialUser.id)
      .order("position", { ascending: true });

    if (!error) setLinks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este enlace?")) return;
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (!error) setLinks(links.filter((l) => l.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);

    // Optimistic update
    setLinks(reordered);

    // Persist all positions to Supabase
    const updates = reordered.map((link, index) =>
      supabase.from("links").update({ position: index }).eq("id", link.id)
    );
    await Promise.all(updates);
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Links", active: true },
    { href: "/dashboard/analytics", icon: BarChart2, label: "Analíticas", active: false },
    { href: "/dashboard/profile", icon: User, label: "Perfil y Apariencia", active: false },
    { href: "/dashboard/settings", icon: Settings, label: "Ajustes", active: false },
  ];

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5]">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="w-64 border-r border-[#eeeeee] dark:border-[#222] min-h-screen p-6 hidden md:flex flex-col">
        <div className="text-2xl font-extrabold tracking-tighter mb-10">bioly.</div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                item.active
                  ? "bg-[#f9fafb] dark:bg-[#111] text-[#111111] dark:text-white border border-[#eeeeee] dark:border-[#333] font-semibold"
                  : "text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/auth/signout"
          className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:text-red-500 transition-colors rounded-xl text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Link>
      </aside>

      {/* ── MOBILE NAV OVERLAY ── */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0a0a0a] border-r border-[#eeeeee] dark:border-[#222] p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div className="text-2xl font-extrabold tracking-tighter">bioly.</div>
              <button onClick={() => setIsMobileNavOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-colors font-medium text-base ${
                    item.active
                      ? "bg-[#f9fafb] dark:bg-[#111] text-[#111111] dark:text-white border border-[#eeeeee] dark:border-[#333] font-semibold"
                      : "text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href="/auth/signout" className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:text-red-500 transition-colors rounded-xl text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Link>
          </nav>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-5 md:p-12 min-w-0">

        {/* Mobile top bar */}
        <div className="flex items-center gap-4 mb-8 md:hidden">
          <button onClick={() => setIsMobileNavOpen(true)} className="p-2.5 border border-[#eeeeee] dark:border-[#222] rounded-xl hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xl font-extrabold tracking-tighter">bioly.</span>
        </div>

        {/* Desktop header */}
        <header className="hidden md:flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-serif mb-2">
              Bienvenido, {initialUser.user_metadata?.username || initialUser.email?.split("@")[0]}
            </h1>
            <p className="text-[#555555] dark:text-[#a1a1aa]">
              Aquí es donde empieza la magia de tu universo digital.
            </p>
          </div>
          <Link href="/auth/signout" className="p-3 border border-[#eeeeee] dark:border-[#222] rounded-full hover:bg-gray-100 dark:hover:bg-[#111] transition-colors">
            <LogOut className="w-5 h-5" />
          </Link>
        </header>

        {/* Section title + add button */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-xl font-semibold">Tus enlaces</h2>
            {links.length > 1 && (
              <p className="text-xs text-[#999999] mt-0.5">Arrastra para reordenar</p>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-black px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md active:scale-[0.98] text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Añadir enlace</span>
            <span className="sm:hidden">Añadir</span>
          </button>
        </div>

        {/* Links list */}
        {loading ? (
          <div className="grid gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222]" />
            ))}
          </div>
        ) : links.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-3">
                {links.map((link) => (
                  <SortableLinkItem key={link.id} link={link} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="p-10 md:p-16 border-2 border-dashed border-[#eeeeee] dark:border-[#222] rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#f9fafb] dark:bg-[#111] rounded-2xl flex items-center justify-center mb-6 border border-[#eeeeee] dark:border-[#333]">
              <LayoutDashboard className="w-8 h-8 text-[#999999]" />
            </div>
            <h2 className="text-2xl font-serif mb-3">Aún no tienes enlaces</h2>
            <p className="text-[#555555] dark:text-[#a1a1aa] mb-8 max-w-sm text-sm md:text-base">
              Añade tu primer enlace para que el mundo pueda ver lo que haces.
            </p>
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
