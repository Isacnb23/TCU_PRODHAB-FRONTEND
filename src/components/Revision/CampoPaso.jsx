import { humanizarClave } from '../../utils/revisionDisplay';
import ObservarCampo from './ObservarCampo';

function esVacio(valor) {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'string') return valor.trim() === '';
  if (Array.isArray(valor)) return valor.length === 0;
  if (typeof valor === 'object') return Object.keys(valor).length === 0;
  return false;
}

function ValorSimple({ valor }) {
  if (esVacio(valor)) return <span className="text-gray-400 italic">Sin dato</span>;
  if (typeof valor === 'boolean') return <span>{valor ? 'Sí' : 'No'}</span>;
  return <span>{String(valor)}</span>;
}

// Tabla para arrays de objetos (ej. inventario de BDs, riesgos, controles).
// Cada CELDA es observable por separado: el identificador de campo estable
// es `${claveArray}[${fila}].${columna}` (ej. "inventario[2].nombreTabla"),
// que no coincide con ninguna clave humana pero es identificable y estable
// entre el momento en que el Admin lo marca y el momento en que el Usuario
// lo ve (se filtra igual por texto exacto de `campo`).
function TablaArray({ paso, valor, claveArray, observacionesPrevias, observacionesNuevasPaso, subsanaciones, expedienteId, onMarcarObservacion, onQuitarObservacion, puedeObservar }) {
  const columnas = Array.from(
    valor.reduce((set, fila) => {
      Object.keys(fila || {})
        .filter((k) => k !== 'id')
        .forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-[#1B2A4A]/5 text-[#1B2A4A] uppercase tracking-wide">
          <tr>
            {columnas.map((col) => (
              <th key={col} className="text-left px-3 py-2 font-semibold">
                {humanizarClave(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {valor.map((fila, i) => (
            <tr key={fila?.id ?? i} className="border-t border-gray-100 hover:bg-gray-50/60">
              {columnas.map((col) => {
                const campoCelda = `${claveArray}[${i}].${col}`;
                return (
                  <td key={col} className="px-3 py-2 text-gray-700 align-top">
                    <ValorSimple valor={fila?.[col]} />
                    <ObservarCampo
                      paso={paso}
                      campo={campoCelda}
                      anteriores={observacionesPrevias.filter((o) => o.campo === campoCelda)}
                      valorNuevo={observacionesNuevasPaso[campoCelda]}
                      subsanaciones={subsanaciones}
                      expedienteId={expedienteId}
                      onGuardar={onMarcarObservacion}
                      onQuitar={onQuitarObservacion}
                      puedeObservar={puedeObservar}
                      compact
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Un campo del paso: label humanizado + su valor, con detección automática
// de forma (tabla si es array de objetos, lista si es array simple, bloque
// anidado si es objeto, texto si es primitivo) + control para que el Admin
// marque una observación puntual sobre ESTE campo (ver ObservarCampo).
export default function CampoPaso({
  paso,
  etiqueta,
  valor,
  campo,
  observacionesPrevias,
  observacionesNuevasPaso,
  subsanaciones,
  expedienteId,
  onMarcarObservacion,
  onQuitarObservacion,
  puedeObservar,
}) {
  if (Array.isArray(valor)) {
    if (valor.length === 0) {
      return (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{etiqueta}</p>
          <p className="text-sm text-gray-400 italic">Ninguno registrado</p>
          <ObservarCampo
            paso={paso}
            campo={campo}
            anteriores={observacionesPrevias.filter((o) => o.campo === campo)}
            valorNuevo={observacionesNuevasPaso[campo]}
            subsanaciones={subsanaciones}
            expedienteId={expedienteId}
            onGuardar={onMarcarObservacion}
            onQuitar={onQuitarObservacion}
            puedeObservar={puedeObservar}
          />
        </div>
      );
    }

    const esArrayDeObjetos = valor.every((v) => v && typeof v === 'object' && !Array.isArray(v));

    return (
      <div className={esArrayDeObjetos ? 'md:col-span-2' : undefined}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{etiqueta}</p>
        {esArrayDeObjetos ? (
          <TablaArray
            paso={paso}
            valor={valor}
            claveArray={campo}
            observacionesPrevias={observacionesPrevias}
            observacionesNuevasPaso={observacionesNuevasPaso}
            subsanaciones={subsanaciones}
            expedienteId={expedienteId}
            onMarcarObservacion={onMarcarObservacion}
            onQuitarObservacion={onQuitarObservacion}
            puedeObservar={puedeObservar}
          />
        ) : (
          <>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
              {valor.map((item, i) => (
                <li key={i}>
                  <ValorSimple valor={item} />
                </li>
              ))}
            </ul>
            <ObservarCampo
              paso={paso}
              campo={campo}
              anteriores={observacionesPrevias.filter((o) => o.campo === campo)}
              valorNuevo={observacionesNuevasPaso[campo]}
              subsanaciones={subsanaciones}
              expedienteId={expedienteId}
              onGuardar={onMarcarObservacion}
              onQuitar={onQuitarObservacion}
              puedeObservar={puedeObservar}
            />
          </>
        )}
      </div>
    );
  }

  if (valor && typeof valor === 'object') {
    const entradas = Object.entries(valor).filter(([, v]) => !esVacio(v));

    if (entradas.length === 0) {
      return (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{etiqueta}</p>
          <p className="text-sm text-gray-400 italic">Sin dato</p>
          <ObservarCampo
            paso={paso}
            campo={campo}
            anteriores={observacionesPrevias.filter((o) => o.campo === campo)}
            valorNuevo={observacionesNuevasPaso[campo]}
            subsanaciones={subsanaciones}
            expedienteId={expedienteId}
            onGuardar={onMarcarObservacion}
            onQuitar={onQuitarObservacion}
            puedeObservar={puedeObservar}
          />
        </div>
      );
    }

    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{etiqueta}</p>
        <div className="pl-3 border-l-2 border-[#1B2A4A]/10 space-y-1">
          {entradas.map(([k, v]) => (
            <div key={k} className="text-sm">
              <span className="text-gray-500">{humanizarClave(k)}: </span>
              <span className="text-gray-900 font-medium">
                <ValorSimple valor={v} />
              </span>
            </div>
          ))}
        </div>
        <ObservarCampo
          paso={paso}
          campo={campo}
          anteriores={observacionesPrevias.filter((o) => o.campo === campo)}
          valorNuevo={observacionesNuevasPaso[campo]}
          subsanaciones={subsanaciones}
          expedienteId={expedienteId}
          onGuardar={onMarcarObservacion}
          onQuitar={onQuitarObservacion}
          puedeObservar={puedeObservar}
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{etiqueta}</p>
      <p className="text-sm text-gray-900 font-medium">
        <ValorSimple valor={valor} />
      </p>
      <ObservarCampo
        paso={paso}
        campo={campo}
        anteriores={observacionesPrevias.filter((o) => o.campo === campo)}
        valorNuevo={observacionesNuevasPaso[campo]}
        subsanaciones={subsanaciones}
        expedienteId={expedienteId}
        onGuardar={onMarcarObservacion}
        onQuitar={onQuitarObservacion}
        puedeObservar={puedeObservar}
      />
    </div>
  );
}
