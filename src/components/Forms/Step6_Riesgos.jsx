import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

/**
 * Step6_Riesgos.jsx - Paso 6: Gestión de Riesgos
 * 
 * Cálculo automático:
 * NRI = Probabilidad (1-5) × Consecuencia (1-16)
 * 
 * Niveles:
 * 1-4: Aceptable (verde)
 * 5-12: Tolerable (amarillo)
 * 16-40: Alto (naranja)
 * 48-80: Muy Alto (rojo)
 * 
 * Artículos del Reglamento: Art. 34, 35, 36
 */

const PROBABILIDADES = [
  { id: 1, nombre: 'Nunca', descripcion: 'Muy improbable' },
  { id: 2, nombre: 'Casi nunca', descripcion: 'Improbable' },
  { id: 3, nombre: 'Ocasionalmente', descripcion: 'Posible' },
  { id: 4, nombre: 'Casi siempre', descripcion: 'Probable' },
  { id: 5, nombre: 'Siempre', descripcion: 'Muy probable' },
];

const CONSECUENCIAS = [
  { id: 1, nombre: 'Insignificante', valor: 1 },
  { id: 2, nombre: 'Leve', valor: 2 },
  { id: 3, nombre: 'Moderado', valor: 4 },
  { id: 4, nombre: 'Pesado', valor: 8 },
  { id: 5, nombre: 'Severo', valor: 16 },
];

/**
 * Calcular nivel de riesgo
 */
function obtenerNivel(nri) {
  if (nri <= 4) return { nivel: 'Aceptable', color: 'bg-green-100 text-green-800' };
  if (nri <= 12) return { nivel: 'Tolerable', color: 'bg-yellow-100 text-yellow-800' };
  if (nri <= 40) return { nivel: 'Alto', color: 'bg-orange-100 text-orange-800' };
  return { nivel: 'Muy Alto', color: 'bg-red-100 text-red-800' };
}

export default function Step6_Riesgos({ data = {}, onChange }) {
  const [riesgos, setRiesgos] = useState(data.riesgos || []);
  const [showMatriz, setShowMatriz] = useState(false);

  useEffect(() => {
    onChange({ riesgos });
  }, [riesgos]);

  /**
   * Agregar nuevo riesgo
   */
  const agregarRiesgo = () => {
    const nuevoRiesgo = {
      id: Date.now(),
      descripcion: '',
      probabilidad: 0,
      consecuencia: 1,
    };
    setRiesgos([...riesgos, nuevoRiesgo]);
  };

  /**
   * Eliminar riesgo
   */
  const eliminarRiesgo = (id) => {
    setRiesgos(riesgos.filter((r) => r.id !== id));
  };

  /**
   * Actualizar riesgo
   */
  const actualizarRiesgo = (id, campo, valor) => {
    setRiesgos(
      riesgos.map((r) =>
        r.id === id ? { ...r, [campo]: valor } : r
      )
    );
  };

  /**
   * Calcular NRI
   */
  const calcularNRI = (probabilidad, consecuencia) => {
    const consObj = CONSECUENCIAS.find((c) => c.id === consecuencia);
    return probabilidad * (consObj?.valor || 1);
  };

  /**
   * Obtener nombre de probabilidad
   */
  const obtenerNombreProbabilidad = (id) => {
    return PROBABILIDADES.find((p) => p.id === id)?.nombre || '';
  };

  /**
   * Obtener nombre de consecuencia
   */
  const obtenerNombreConsecuencia = (id) => {
    return CONSECUENCIAS.find((c) => c.id === id)?.nombre || '';
  };

  /**
   * Estadísticas
   */
  const estadisticas = {
    total: riesgos.length,
    aceptables: riesgos.filter(
      (r) => calcularNRI(r.probabilidad, r.consecuencia) <= 4
    ).length,
    tolerables: riesgos.filter((r) => {
      const nri = calcularNRI(r.probabilidad, r.consecuencia);
      return nri > 4 && nri <= 12;
    }).length,
    altos: riesgos.filter((r) => {
      const nri = calcularNRI(r.probabilidad, r.consecuencia);
      return nri > 12 && nri <= 40;
    }).length,
    muyAltos: riesgos.filter(
      (r) => calcularNRI(r.probabilidad, r.consecuencia) > 40
    ).length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          📈 <strong>Paso 6: Gestión de Riesgos</strong>
          <br />
          Identifica riesgos de seguridad. Se calcula automáticamente el NRI
          (Número de Riesgo Inherente).
        </p>
      </div>

      {/* Botón mostrar matriz */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMatriz(!showMatriz)}
          className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {showMatriz ? '🔽 Ocultar' : '🔼 Ver'} Matriz Visual
        </motion.button>
      </div>

      {/* Matriz visual */}
      {showMatriz && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto border border-gray-300 rounded-lg bg-white p-4"
        >
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Matriz Probabilidad × Consecuencia
          </p>

          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 px-2 py-2 bg-gray-100 text-xs font-semibold">
                  P\C
                </th>
                {CONSECUENCIAS.map((c) => (
                  <th
                    key={c.id}
                    className="border border-gray-300 px-2 py-2 bg-gray-100 text-xs font-semibold text-center"
                  >
                    {c.nombre}
                    <br />({c.valor})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROBABILIDADES.map((p) => (
                <tr key={p.id}>
                  <td className="border border-gray-300 px-2 py-2 bg-gray-100 text-xs font-semibold">
                    {p.nombre} ({p.id})
                  </td>
                  {CONSECUENCIAS.map((c) => {
                    const nri = p.id * c.valor;
                    const { color } = obtenerNivel(nri);
                    return (
                      <td
                        key={`${p.id}-${c.id}`}
                        className={`border border-gray-300 px-2 py-2 text-center text-xs font-semibold ${color}`}
                      >
                        {nri}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Leyenda */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300"></div>
              <span>Aceptable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300"></div>
              <span>Tolerable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300"></div>
              <span>Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300"></div>
              <span>Muy Alto</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabla de riesgos */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          {/* Encabezados */}
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Descripción del Riesgo <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Probabilidad <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Consecuencia <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                NRI
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Nivel
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Filas */}
          <tbody>
            {riesgos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  <p>No hay riesgos registrados</p>
                </td>
              </tr>
            ) : (
              riesgos.map((riesgo) => {
                const nri = calcularNRI(
                  riesgo.probabilidad,
                  riesgo.consecuencia
                );
                const { nivel, color } = obtenerNivel(nri);

                return (
                  <motion.tr
                    key={riesgo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    {/* Descripción */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={riesgo.descripcion}
                        onChange={(e) =>
                          actualizarRiesgo(
                            riesgo.id,
                            'descripcion',
                            e.target.value
                          )
                        }
                        placeholder="Ej: Acceso no autorizado a BD"
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Probabilidad */}
                    <td className="px-4 py-3">
                      <select
                        value={riesgo.probabilidad}
                        onChange={(e) =>
                          actualizarRiesgo(
                            riesgo.id,
                            'probabilidad',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="0">--</option>
                        {PROBABILIDADES.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id}. {p.nombre}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Consecuencia */}
                    <td className="px-4 py-3">
                      <select
                        value={riesgo.consecuencia}
                        onChange={(e) =>
                          actualizarRiesgo(
                            riesgo.id,
                            'consecuencia',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="1">--</option>
                        {CONSECUENCIAS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} ({c.valor})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* NRI (automático) */}
                    <td className="px-4 py-3 text-center font-bold text-gray-900">
                      {riesgo.probabilidad > 0 ? nri : '-'}
                    </td>

                    {/* Nivel */}
                    <td className="px-4 py-3 text-center">
                      {riesgo.probabilidad > 0 && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${color}`}
                        >
                          {nivel}
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => eliminarRiesgo(riesgo.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Botón agregar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={agregarRiesgo}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Plus className="w-4 h-4" />
        Agregar Riesgo
      </motion.button>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">
            {estadisticas.aceptables}
          </p>
          <p className="text-xs text-green-600">Aceptables</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">
            {estadisticas.tolerables}
          </p>
          <p className="text-xs text-yellow-600">Tolerables</p>
        </div>
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">
            {estadisticas.altos}
          </p>
          <p className="text-xs text-orange-600">Altos</p>
        </div>
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-700">
            {estadisticas.muyAltos}
          </p>
          <p className="text-xs text-red-600">Muy Altos</p>
        </div>
      </div>
    </motion.div>
  );
}