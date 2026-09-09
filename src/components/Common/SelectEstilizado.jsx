import { ChevronDown } from 'lucide-react';

/**
 * SelectEstilizado.jsx - Reemplazo visual transparente de un <select> nativo
 *
 * Oculta la flechita nativa del navegador (appearance-none) y superpone un
 * ChevronDown de lucide-react, para que combine con el resto del sistema.
 * Acepta las mismas props que un <select> normal (value, onChange, name,
 * disabled, children, className, etc.) — no cambia comportamiento ni lógica.
 */
export default function SelectEstilizado({ className = '', children, ...rest }) {
  return (
    <div className="relative w-full">
      <select
        {...rest}
        className={`appearance-none w-full pl-3 pr-9 py-2 rounded-lg border border-gray-300
          bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30
          focus:border-[#1B2A4A] transition-colors cursor-pointer disabled:opacity-50
          disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
