import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Target } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';
import StepSummary from '../Common/StepSummary';

/**
 * Sugerencias frecuentes de nombres de datos (para el datalist).
 * No limita la entrada: el usuario puede escribir cualquier valor.
 */
const DATOS_SUGERIDOS = [
  'Nombre completo',
  'Cédula de identidad',
  'Número de teléfono',
  'Correo electrónico',
  'Dirección',
  'Fecha de nacimiento',
  'Sexo',
  'Número de expediente',
  'Fotografía',
  'Huella digital',
  'Salario',
  'Diagnóstico médico',
  'Historial médico',
  'Número de cuenta bancaria',
];

/**
 * Step4_Finalidad.jsx - Paso 4: Finalidad y Datos Recopilados
 * 
 * Campos:
 * - Finalidad del tratamiento (texto)
 * - Base legal (select)
 * - Tabla de datos recopilados (nombre, tipo, obligatorio/opcional)
 * - Agregar/eliminar datos
 * 
 * Artículos del Reglamento: Art. 27, 32
 */

const TIPOS_DATOS = [
  'Identificación',
  'Contacto',
  'Biométrico',
  'Financiero',
  'Médico',
  'Laboral',
  'Educativo',
  'Judicial',
  'Otro',
];

const BASES_LEGALES = [
  'Ley Nº 8968 (Protección de Datos)',
  'Código de Trabajo',
  'Ley de Seguro Social',
  'Ley General de Salud',
  'Ley Electoral',
  'Ley de Educación',
  'Decreto Ejecutivo',
  'Reglamento de ley',
  'Consentimiento del sujeto',
  'Otra',
];

export default function Step4_Finalidad({ data = {}, onChange }) {
  const [formData, setFormData] = useState({
    finalidad: data.finalidad || '',
    baseLegal: data.baseLegal || '',
    datosRecopilados: data.datosRecopilados || [],
  });

  useEffect(() => {
    const isValid = !!(
      formData.finalidad?.trim() &&
      formData.baseLegal &&
      formData.datosRecopilados.length > 0 &&
      formData.datosRecopilados.every((d) => d.nombre.trim() && d.tipo)
    );
    onChange(formData, isValid);
  }, [formData]);

  /**
   * Agregar nuevo dato recopilado
   */
  const agregarDato = () => {
    const nuevoDato = {
      id: Date.now(),
      nombre: '',
      tipo: '',
      obligatorio: true,
    };
    setFormData((prev) => ({
      ...prev,
      datosRecopilados: [...prev.datosRecopilados, nuevoDato],
    }));
  };

  /**
   * Eliminar dato
   */
  const eliminarDato = (id) => {
    setFormData((prev) => ({
      ...prev,
      datosRecopilados: prev.datosRecopilados.filter((d) => d.id !== id),
    }));
  };

  /**
   * Actualizar dato
   */
  const actualizarDato = (id, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      datosRecopilados: prev.datosRecopilados.map((d) =>
        d.id === id ? { ...d, [campo]: valor } : d
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
      <InfoBanner
        Icon={Target}
        title="Paso 4: Finalidad y Datos Recopilados"
        description="Define el propósito del tratamiento de datos y registra qué datos personales recopila tu base de datos."
      />

      {/* Sugerencias de nombres de datos frecuentes (para los inputs de la tabla) */}
      <datalist id="datos-sugeridos">
        {DATOS_SUGERIDOS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>

      {/* Finalidad del tratamiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Finalidad del Tratamiento de Datos{' '}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.finalidad}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              finalidad: e.target.value,
            }))
          }
          placeholder="Ej: Mantener registro de pacientes para atención médica conforme a la Ley General de Salud..."
          rows="4"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>

      {/* Base Legal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Base Legal <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.baseLegal}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              baseLegal: e.target.value,
            }))
          }
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">-- Selecciona --</option>
          {BASES_LEGALES.map((base) => (
            <option key={base} value={base}>
              {base}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de datos recopilados */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Datos Personales Recopilados
        </h3>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            {/* Encabezados */}
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Nombre del Dato <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Tipo de Dato <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Carácter
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>

            {/* Filas */}
            <tbody>
              {formData.datosRecopilados.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <p>No hay datos registrados</p>
                  </td>
                </tr>
              ) : (
                formData.datosRecopilados.map((dato) => (
                  <motion.tr
                    key={dato.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    {/* Nombre del dato */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        list="datos-sugeridos"
                        value={dato.nombre}
                        onChange={(e) =>
                          actualizarDato(
                            dato.id,
                            'nombre',
                            e.target.value
                          )
                        }
                        placeholder="Ej: Nombre completo"
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </td>

                    {/* Tipo de dato */}
                    <td className="px-4 py-3">
                      <select
                        value={dato.tipo}
                        onChange={(e) =>
                          actualizarDato(
                            dato.id,
                            'tipo',
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      >
                        <option value="">--</option>
                        {TIPOS_DATOS.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Obligatorio / Opcional */}
                    <td className="px-4 py-3">
                      <select
                        value={dato.obligatorio ? 'obligatorio' : 'opcional'}
                        onChange={(e) =>
                          actualizarDato(
                            dato.id,
                            'obligatorio',
                            e.target.value === 'obligatorio'
                          )
                        }
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      >
                        <option value="obligatorio">
                          Obligatorio
                        </option>
                        <option value="opcional">Opcional</option>
                      </select>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => eliminarDato(dato.id)}
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
          onClick={agregarDato}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Agregar Dato
        </motion.button>
      </div>

      {/* Resumen */}
      <StepSummary
        items={[
          `Finalidad: ${formData.finalidad ? '✅' : '⏳ Pendiente'}`,
          `Base legal: ${formData.baseLegal ? '✅' : '⏳ Pendiente'}`,
          <>Datos recopilados: <strong>{formData.datosRecopilados.length}</strong></>,
          <>
            Obligatorios:{' '}
            <strong>
              {formData.datosRecopilados.filter((d) => d.obligatorio).length}
            </strong>
          </>,
        ]}
      />
    </motion.div>
  );
}