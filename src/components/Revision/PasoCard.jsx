import { CheckCircle2, Circle, MessageSquareWarning } from 'lucide-react';
import CampoPaso from './CampoPaso';
import { AMBITOS_AMENAZAS, LABELS_PASO_1, humanizarClave } from '../../utils/revisionDisplay';

function formatFechaHora(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Paso 3 guarda { respuestas: { ambito_1_q_1: 'si'|'no', ... } } (Step3_Amenazas.jsx
// guarda los valores en minúscula): se agrupa por ámbito y se muestra la pregunta real
// (ver AMBITOS_AMENAZAS), no la clave. Se compara sin distinguir mayúsculas por si el
// dato viniera en otro casing.
function ContenidoAmenazas({ datos }) {
  const respuestas = datos?.respuestas || {};

  if (Object.keys(respuestas).length === 0) {
    return <p className="text-sm text-gray-400 italic">Sin dato</p>;
  }

  return (
    <div className="space-y-4">
      {AMBITOS_AMENAZAS.map((ambito) => (
        <div key={ambito.id}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{ambito.nombre}</p>
          <ul className="text-sm text-gray-700 space-y-1">
            {ambito.preguntas.map((pregunta, i) => {
              const clave = `ambito_${ambito.id}_q_${i + 1}`;
              const respuesta = respuestas[clave];
              const respuestaNorm = typeof respuesta === 'string' ? respuesta.toUpperCase() : respuesta;
              return (
                <li key={clave} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 inline-block w-9 flex-shrink-0 text-xs font-semibold text-center rounded px-1 ${
                      respuestaNorm === 'SI'
                        ? 'bg-green-50 text-green-700'
                        : respuestaNorm === 'NO'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {respuestaNorm || '—'}
                  </span>
                  <span>{pregunta}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ContenidoGenerico({ paso, datos }) {
  const claves = Object.keys(datos || {}).sort((a, b) => a.localeCompare(b));

  if (claves.length === 0) {
    return <p className="text-sm text-gray-400 italic">Sin datos registrados en este paso.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {claves.map((clave) => {
        const etiqueta = paso === 1 ? LABELS_PASO_1[clave] || humanizarClave(clave) : humanizarClave(clave);
        return <CampoPaso key={clave} etiqueta={etiqueta} valor={datos[clave]} />;
      })}
    </div>
  );
}

export default function PasoCard({
  paso,
  titulo,
  datos,
  completado,
  observacionesPrevias,
  valorObservacion,
  onChangeObservacion,
  puedeObservar,
}) {
  const tieneObservacion = observacionesPrevias.length > 0;

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border ${
        tieneObservacion ? 'border-amber-300 ring-1 ring-amber-200/70' : 'border-gray-200'
      }`}
    >
      <div
        className={`flex items-center justify-between px-5 py-3 border-b ${
          tieneObservacion ? 'border-amber-200 bg-amber-50/70' : 'border-gray-100 bg-gray-50/60'
        }`}
      >
        <div className="flex items-center gap-2">
          {completado ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Circle className="w-4 h-4 text-gray-300" />
          )}
          <h3 className="font-semibold text-[#1B2A4A]">
            Paso {paso} · {titulo}
          </h3>
        </div>
        {tieneObservacion && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-2 py-0.5">
            <MessageSquareWarning className="w-2.5 h-2.5" />
            Con observación
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        {paso === 3 ? <ContenidoAmenazas datos={datos} /> : <ContenidoGenerico paso={paso} datos={datos} />}
      </div>

      {observacionesPrevias.length > 0 && (
        <div className="px-5 pb-4 space-y-2">
          {observacionesPrevias.map((obs) => (
            <div
              key={obs.id}
              className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2"
            >
              <MessageSquareWarning className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p>
                  <span className="font-semibold">Observación anterior:</span> {obs.texto}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">{formatFechaHora(obs.fechaCreacion)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {puedeObservar && (
        <div className="px-5 pb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Observación para este paso (opcional)
          </label>
          <textarea
            value={valorObservacion}
            onChange={(e) => onChangeObservacion(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Ej: Falta detallar el diagrama entidad-relación..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
          />
        </div>
      )}
    </div>
  );
}
