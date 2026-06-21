import { PiX, PiCheck, PiStar } from "react-icons/pi";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export default function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#999] hover:text-[#111] dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#222] rounded-full cursor-pointer"
          >
            <PiX className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <PiStar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#111] dark:text-white mb-2">
            Desbloquea {featureName}
          </h2>
          <p className="text-[#555] dark:text-[#a1a1aa] mb-6 text-sm leading-relaxed">
            Esta función es exclusiva para usuarios Pro. Sube de nivel hoy mismo y lleva tu identidad digital al siguiente nivel.
          </p>

          <div className="space-y-3 mb-8">
            {["Controles SEO completos", "Quitar marca de agua de Bioly", "Analíticas avanzadas", "Vende productos digitales"].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium">
                <PiCheck className="w-4 h-4 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              href="/pricing" 
              className="w-full bg-[#111] dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-bold text-center hover:opacity-90 transition-opacity cursor-pointer"
            >
              Ver Planes Premium
            </Link>
            <button 
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-[#777] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
