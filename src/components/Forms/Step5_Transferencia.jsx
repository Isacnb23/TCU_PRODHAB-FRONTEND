import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

/**
 * Step5_Transferencia.jsx - Paso 5: Transferencias de Datos
 * 
 * Lógica condicional:
 * - ¿Realizas transferencias internacionales? SÍ/NO
 * - Si SÍ: Mostrar tabla de transferencias
 * - Si NO: Ocultar (opcional)
 * 
 * Campos:
 * - País destino
 * - Tipo de transferencia
 * - Justificación
 * - Base legal
 * 
 * Artículos del Reglamento: Art. 27, 32
 */

const PAISES = [
  'Costa Rica',
  'Estados Unidos',
  'México',
  'Panamá',
  'Colombia',
  'España',
  'Unión Europea',
  'Otro',
];

const TIPOS_TRANSFERENCIA = [
  'Procesamiento de datos',
  'Almacenamiento en la nube',
  'Análisis de datos',
  'Respaldo de seguridad',
  'Prestación de servicios',
  'Obligación legal',
  'Otra',
];

export default function Step5_Transferencia({ data = {}, onChange }) {
  const [formData, setFormData] = useState({
    realizaTransferencias: data.realizaTransferencias || false,
    transferencias: data.transferencias || [],
    justificacionGeneral: data.justificacionGeneral || '',
  });

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  /**
   * Cambiar respuesta inicial
   */
  const cambiarRespuesta = (valor) => {
    setFormData((prev) => ({
      ...prev,
      realizaTransferencias: valor,
      // Si dice NO, limpiar transferencias
      transferencias: valor ? prev.transferencias : [],
    }));
  };

  /**
   * Agregar transferencia
   */
  const agregarTransferencia = () => {
    const nueva = {
      id: Date.now(),
      pais: '',
      tipo: '',
      justificacion: '',
      baseLegal: '',
    };
    setFormData((prev) => ({
      ...prev,
      transferencias: [...prev.transferencias, nueva],
    }));
  };

  /**
   * Eliminar transferencia
   */
  const eliminarTransferencia = (id) => {
    setFormData((prev) => ({
      ...prev,
      transferencias: prev.transferencias.filter((t) => t.id !== id),
    }));
  };

  /**
   * Actualizar transferencia
   */
  const actualizarTransferencia = (id, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      transferencias: prev.transferencias.map((t) =>
        t.id === id ? { ...t, [campo]: valor } : t
      ),
    }));
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
          🔄 <strong>Paso 5: Transferencias Internacionales</strong>
          <br />
          Especifica si realizas transferencias de datos personales a otros
          países.
        </p>
      </div>

      {/* Pregunta inicial */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-sm font-semibold text-gray-900 mb-4">
          ¿Realizas transferencias de datos personales a otros países?
        </p>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => cambiarRespuesta(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              formData.realizaTransferencias
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✓ SÍ
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => cambiarRespuesta(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              !formData.realizaTransferencias
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✗ NO
          </motion.button>
        </div>
      </div>

      {/* Si responde SÍ, mostrar tabla */}
      <AnimatePresence>
        {formData.realizaTransferencias && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Alerta */}
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                <strong>Importante:</strong> Las transferencias internacionales
                de datos personales requieren base legal sólida. Asegúrate de
                cumplir con la Ley Nº 8968 y las regulaciones del país destino.
              </p>
            </div>

            {/* Justificación general */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación General de Transferencias
              </label>
              <textarea
                value={formData.justificacionGeneral}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    justificacionGeneral: e.target.value,
                  }))
                }
                placeholder="Ej: Transferimos datos a proveedores de servicios en nube para almacenamiento seguro..."
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Tabla de transferencias */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                {/* Encabezados */}
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      País Destino <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tipo de Transferencia{' '}
                      <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Justificación
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Base Legal
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>

                {/* Filas */}
                <tbody>
                  {formData.transferencias.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        <p>No hay transferencias registradas</p>
                      </td>
                    </tr>
                  ) : (
                    formData.transferencias.map((trans) => (
                      <motion.tr
                        key={trans.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        {/* País */}
                        <td className="px-4 py-3">
                          <select
                            value={trans.pais}
                            onChange={(e) =>
                              actualizarTransferencia(
                                trans.id,
                                'pais',
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">--</option>
                            {PAISES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Tipo */}
                        <td className="px-4 py-3">
                          <select
                            value={trans.tipo}
                            onChange={(e) =>
                              actualizarTransferencia(
                                trans.id,
                                'tipo',
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">--</option>
                            {TIPOS_TRANSFERENCIA.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Justificación */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={trans.justificacion}
                            onChange={(e) =>
                              actualizarTransferencia(
                                trans.id,
                                'justificacion',
                                e.target.value
                              )
                            }
                            placeholder="Breve descripción"
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* Base legal */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={trans.baseLegal}
                            onChange={(e) =>
                              actualizarTransferencia(
                                trans.id,
                                'baseLegal',
                                e.target.value
                              )
                            }
                            placeholder="Ej: Ley 8968"
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3 text-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => eliminarTransferencia(trans.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Botón agregar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={agregarTransferencia}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Agregar Transferencia
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Si responde NO, mostrar confirmación */}
      <AnimatePresence>
        {!formData.realizaTransferencias && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-300 rounded-lg p-4"
          >
            <p className="text-sm text-green-800">
              ✅ <strong>Confirmado:</strong> No realizas transferencias
              internacionales de datos personales.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-2">
          📋 RESUMEN DEL PASO
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            ✓ ¿Realiza transferencias?:{' '}
            {formData.realizaTransferencias ? '✅ SÍ' : '✅ NO'}
          </li>
          {formData.realizaTransferencias && (
            <>
              <li>
                ✓ Transferencias registradas:{' '}
                <strong>{formData.transferencias.length}</strong>
              </li>
              <li>
                ✓ Justificación general:{' '}
                {formData.justificacionGeneral ? '✅' : '⏳'}
              </li>
            </>
          )}
        </ul>
      </div>
    </motion.div>
  );
}