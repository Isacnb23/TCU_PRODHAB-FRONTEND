/**
 * Dropdown.jsx - Selector reutilizable
 *
 * Mismos estados visuales que InputField:
 * - Normal: borde gris (gray-200)
 * - Con valor válido: borde dorado (#C9A84C/60)
 * - Con error: borde rojo + ring rojo suave
 * - Foco: ring azul marino suave (#1B2A4A/20)
 *
 * Dropdown custom (no <select> nativo): el navegador no permite estilizar la
 * lista desplegada, así que se arma con <button> + lista absoluta. Mantiene
 * exactamente el mismo contrato de props (label, value, onChange(name, value),
 * options como array de strings, error, touched, name, required) para no tener
 * que tocar dónde se usa.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Dropdown({
  label,
  value,
  onChange,
  options,
  error,
  touched,
  name,
  required = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  const hasError = error && touched;
  const isFilled = value !== undefined && value !== null && String(value).length > 0;

  const borderClass = hasError
    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
    : isFilled
    ? 'border-[#C9A84C]/60 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]'
    : 'border-gray-200 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]';

  useEffect(() => {
    function handleClickAfuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setAbierto(false);
    }
    document.addEventListener('mousedown', handleClickAfuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function seleccionar(opt) {
    onChange(name, opt);
    setAbierto(false);
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#C9A84C] ml-0.5">*</span>}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className={`w-full appearance-none pl-4 pr-10 py-3 rounded-xl border transition-all
            text-left cursor-pointer focus:ring-2 focus:outline-none ${borderClass}`}
        >
          {value || <span className="text-gray-400">-- Selecciona --</span>}
        </button>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2
            pointer-events-none transition-transform ${abierto ? 'rotate-180' : ''}`}
        />

        {abierto && (
          <div
            className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-200
              shadow-lg shadow-[#1B2A4A]/10 overflow-hidden py-1 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => seleccionar(opt)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left
                  transition-colors ${
                    opt === value
                      ? 'bg-[#1B2A4A]/5 text-[#1B2A4A] font-semibold'
                      : 'text-gray-700 hover:bg-[#C9A84C]/10'
                  }`}
              >
                {opt}
                {opt === value && <Check className="w-3.5 h-3.5 text-[#1B2A4A]" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>
      )}
    </div>
  );
}
