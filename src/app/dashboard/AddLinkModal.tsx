"use client";

import { useState } from "react";
import { X, Link as LinkIcon, Type, Globe } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddLinkModal({ isOpen, onClose, onSuccess }: AddLinkModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No estás autenticado");

      const { error: insertError } = await supabase
        .from("links")
        .insert([
          {
            user_id: user.id,
            title,
            url,
            is_active: true,
          }
        ]);

      if (insertError) throw insertError;

      setTitle("");
      setUrl("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el enlace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif text-[#111111] dark:text-white">Añadir nuevo enlace</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#999999]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#555555] dark:text-[#a1a1aa] mb-2 ml-1">Título del enlace</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-2xl py-4 pl-12 pr-4 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium"
                  placeholder="Ej: Mi canal de YouTube"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#555555] dark:text-[#a1a1aa] mb-2 ml-1">URL (Destino)</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-2xl py-4 pl-12 pr-4 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium"
                  placeholder="https://youtube.com/@tu_canal"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 rounded-2xl font-semibold border border-[#eeeeee] dark:border-[#222] text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#222] transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-black/5 dark:shadow-white/5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : (
                  <>Guardar enlace</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
