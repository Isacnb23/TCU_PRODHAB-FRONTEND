import { humanizarClave } from '../../utils/revisionDisplay';

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
function TablaArray({ valor }) {
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
        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wide">
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
            <tr key={fila?.id ?? i} className="border-t border-gray-100">
              {columnas.map((col) => (
                <td key={col} className="px-3 py-2 text-gray-700 align-top">
                  <ValorSimple valor={fila?.[col]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Un campo del paso: label humanizado + su valor, con detección automática
// de forma (tabla si es array de objetos, lista si es array simple, bloque
// anidado si es objeto, texto si es primitivo).
export default function CampoPaso({ etiqueta, valor }) {
  if (Array.isArray(valor)) {
    if (valor.length === 0) {
      return (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{etiqueta}</p>
          <p className="text-sm text-gray-400 italic">Ninguno registrado</p>
        </div>
      );
    }

    const esArrayDeObjetos = valor.every((v) => v && typeof v === 'object' && !Array.isArray(v));

    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{etiqueta}</p>
        {esArrayDeObjetos ? (
          <TablaArray valor={valor} />
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
            {valor.map((item, i) => (
              <li key={i}>
                <ValorSimple valor={item} />
              </li>
            ))}
          </ul>
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
        </div>
      );
    }

    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{etiqueta}</p>
        <div className="pl-3 border-l-2 border-gray-100 space-y-1">
          {entradas.map(([k, v]) => (
            <div key={k} className="text-sm">
              <span className="text-gray-500">{humanizarClave(k)}: </span>
              <span className="text-gray-800">
                <ValorSimple valor={v} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{etiqueta}</p>
      <p className="text-sm text-gray-800">
        <ValorSimple valor={valor} />
      </p>
    </div>
  );
}
