import { useEffect, useRef, useState, Children, isValidElement } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * SelectEstilizado.jsx - Reemplazo visual transparente de un <select> nativo
 *
 * El <select> nativo no permite estilizar la lista desplegada (queda con el azul
 * del sistema operativo), así que esto es un dropdown custom con <button> + lista
 * absoluta, pero acepta las MISMAS props que un <select> normal (value, onChange,
 * disabled, name, children como <option>) para ser un reemplazo transparente en
 * los lugares que ya lo usan (RevisionBandeja.jsx, NuevoUsuarioModal.jsx) — no
 * cambia comportamiento ni lógica, solo cómo se ve la lista al abrirse.
 */
export default function SelectEstilizado({
  className = '',
  children,
  value,
  onChange,
  disabled = false,
  name,
  placeholder,
  ...rest
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  const opciones = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      value: child.props.value,
      label: child.props.children,
      disabled: child.props.disabled,
    }));

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

  const opcionActual = opciones.find((o) => o.value === value);

  function seleccionar(opt) {
    if (opt.disabled) return;
    onChange?.({ target: { name, value: opt.value } });
    setAbierto(false);
  }

  return (
    <div ref={ref} className="relative w-full" {...rest}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAbierto((v) => !v)}
        className={`appearance-none w-full pl-3 pr-9 py-2 rounded-lg border border-gray-300
          bg-white text-sm text-left text-gray-700 hover:border-[#1B2A4A]/40
          focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A]
          transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {opcionActual?.label ?? placeholder ?? ''}
      </button>
      <ChevronDown
        className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2
          pointer-events-none transition-transform ${abierto ? 'rotate-180' : ''}`}
      />

      {abierto && !disabled && (
        <div
          className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-gray-200
            shadow-lg shadow-[#1B2A4A]/10 overflow-hidden py-1 max-h-60 overflow-y-auto"
        >
          {opciones.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => seleccionar(opt)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  opt.value === value
                    ? 'bg-[#1B2A4A]/5 text-[#1B2A4A] font-semibold'
                    : 'text-gray-700 hover:bg-[#C9A84C]/10'
                }`}
            >
              {opt.label}
              {opt.value === value && <Check className="w-3.5 h-3.5 text-[#1B2A4A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
