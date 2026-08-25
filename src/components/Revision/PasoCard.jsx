import { CheckCircle2, Circle, MessageSquareWarning } from 'lucide-react';
import CampoPaso from './CampoPaso';
import ObservarCampo from './ObservarCampo';
import { AMBITOS_AMENAZAS, LABELS_PASO_1, humanizarClave } from '../../utils/revisionDisplay';

// Paso 3 guarda { respuestas: { ambito_1_q_1: 'si'|'no', ... } } (Step3_Amenazas.jsx
// guarda los valores en minúscula): se agrupa por ámbito y se muestra la pregunta real
// (ver AMBITOS_AMENAZAS), no la clave. Se compara sin distinguir mayúsculas por si el
// dato viniera en otro casing. La clave `ambito_{id}_q_{indice}` es también el `campo`
// que se envía al backend al observar una pregunta puntual.
function ContenidoAmenazas({ paso, datos, observacionesPrevias, observacionesNuevasPaso, subsanaciones, expedienteId, onMarcarObservacion, onQuitarObservacion, puedeObservar }) {
  const respuestas = datos?.respuestas || {};

  if (Object.keys(respuestas).length === 0) {
    return <p className="text-sm text-gray-400 italic">Sin dato</p>;
  }

  return (
    <div className="space-y-4">
      {AMBITOS_AMENAZAS.map((ambito) => (
        <div key={ambito.id}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{ambito.nombre}</p>
          <ul className="text-sm text-gray-700 space-y-2">
            {ambito.preguntas.map((pregunta, i) => {
              const clave = `ambito_${ambito.id}_q_${i + 1}`;
              const respuesta = respuestas[clave];
              const respuestaNorm = typeof respuesta === 'string' ? respuesta.toUpperCase() : respuesta;
              return (
                <li key={clave}>
                  <div className="flex items-start gap-2">
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
                  </div>
                  <div className="pl-11">
                    <ObservarCampo
                      paso={paso}
                      campo={clave}
                      anteriores={observacionesPrevias.filter((o) => o.campo === clave)}
                      valorNuevo={observacionesNuevasPaso[clave]}
                      subsanaciones={subsanaciones}
                      expedienteId={expedienteId}
                      onGuardar={onMarcarObservacion}
                      onQuitar={onQuitarObservacion}
                      puedeObservar={puedeObservar}
                      compact
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ContenidoGenerico({ paso, datos, observacionesPrevias, observacionesNuevasPaso, subsanaciones, expedienteId, onMarcarObservacion, onQuitarObservacion, puedeObservar }) {
  const claves = Object.keys(datos || {}).sort((a, b) => a.localeCompare(b));

  if (claves.length === 0) {
    return <p className="text-sm text-gray-400 italic">Sin datos registrados en este paso.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {claves.map((clave) => {
        const etiqueta = paso === 1 ? LABELS_PASO_1[clave] || humanizarClave(clave) : humanizarClave(clave);
        return (
          <CampoPaso
            key={clave}
            paso={paso}
            etiqueta={etiqueta}
            valor={datos[clave]}
            campo={clave}
            observacionesPrevias={observacionesPrevias}
            observacionesNuevasPaso={observacionesNuevasPaso}
            subsanaciones={subsanaciones}
            expedienteId={expedienteId}
            onMarcarObservacion={onMarcarObservacion}
            onQuitarObservacion={onQuitarObservacion}
            puedeObservar={puedeObservar}
          />
        );
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
  observacionesNuevasPaso,
  subsanaciones,
  expedienteId,
  onMarcarObservacion,
  onQuitarObservacion,
  puedeObservar,
}) {
  const tieneObservacionNueva = Object.values(observacionesNuevasPaso || {}).some((t) => (t || '').trim().length > 0);
  const tieneObservacion = observacionesPrevias.length > 0 || tieneObservacionNueva;

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
        {paso === 3 ? (
          <ContenidoAmenazas
            paso={paso}
            datos={datos}
            observacionesPrevias={observacionesPrevias}
            observacionesNuevasPaso={observacionesNuevasPaso}
            subsanaciones={subsanaciones}
            expedienteId={expedienteId}
            onMarcarObservacion={onMarcarObservacion}
            onQuitarObservacion={onQuitarObservacion}
            puedeObservar={puedeObservar}
          />
        ) : (
          <ContenidoGenerico
            paso={paso}
            datos={datos}
            observacionesPrevias={observacionesPrevias}
            observacionesNuevasPaso={observacionesNuevasPaso}
            subsanaciones={subsanaciones}
            expedienteId={expedienteId}
            onMarcarObservacion={onMarcarObservacion}
            onQuitarObservacion={onQuitarObservacion}
            puedeObservar={puedeObservar}
          />
        )}
      </div>
    </div>
  );
}
