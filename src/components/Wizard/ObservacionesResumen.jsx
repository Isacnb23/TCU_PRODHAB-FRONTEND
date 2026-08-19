import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { PASO_TITULOS } from '../../utils/revisionDisplay';

// Panel destacado que resume las observaciones del Admin al entrar a un
// expediente en RequiereSubsanacion, agrupadas por paso, con acceso directo.
export default function ObservacionesResumen({ observaciones, onIrAlPaso }) {
  const [colapsado, setColapsado] = useState(false);

  const porPaso = observaciones.reduce((acc, obs) => {
    (acc[obs.paso] ||= []).push(obs);
    return acc;
  }, {});
  const pasos = Object.keys(porPaso)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="max-w-4xl mx-auto mb-6 rounded-xl bg-amber-50 border border-amber-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setColapsado((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
          <AlertTriangle size={16} className="flex-shrink-0" />
          Este expediente requiere subsanación
        </span>
        {colapsado ? (
          <ChevronDown size={18} className="text-amber-600 flex-shrink-0" />
        ) : (
          <ChevronUp size={18} className="text-amber-600 flex-shrink-0" />
        )}
      </button>

      {!colapsado && (
        <div className="px-5 pb-4 space-y-2">
          {pasos.map((paso) => (
            <div
              key={paso}
              className="flex items-start justify-between gap-3 bg-white/60 border border-amber-100 rounded-lg px-3 py-2"
            >
              <p className="text-sm text-amber-900">
                <span className="font-semibold">
                  Paso {paso} — {PASO_TITULOS[paso]}:
                </span>{' '}
                {porPaso[paso].map((o) => o.texto).join(' · ')}
              </p>
              <button
                type="button"
                onClick={() => onIrAlPaso(paso)}
                className="flex-shrink-0 text-xs font-semibold text-amber-800 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors"
              >
                Ir al paso
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
