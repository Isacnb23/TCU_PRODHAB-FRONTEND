import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Target } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';
import StepSummary from '../Common/StepSummary';
import OptionalSection from '../Common/OptionalSection';
import CampoObservacion from '../Wizard/CampoObservacion';

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

// Valores posibles para los campos SÍ/NO nuevos (mismo patrón que Step8_Adicionales.jsx):
// '' = sin responder (default seguro para expedientes viejos que no tienen el campo).
const SI_NO = ['', 'SI', 'NO'];

// Default de las columnas nuevas de una fila de datosRecopilados. Se combina con lo ya
// guardado (`{ ...DATO_NUEVO_DEFAULT, ...d }`) para que una fila de un expediente viejo,
// que no tiene estas claves, quede con default seguro sin perder nombre/tipo/obligatorio.
const DATO_NUEVO_DEFAULT = {
  fuente: '',
  uso: '',
  personasMenores: '',
  personasDiscapacidad: '',
  personasFuncionarias: '',
  personasVulnerables: '',
  vigencia: '',
};

export default function Step4_Finalidad({ data = {}, onChange, subsanacion }) {
  const [formData, setFormData] = useState({
    finalidad: data.finalidad || '',
    baseLegal: data.baseLegal || '',
    datosRecopilados: (data.datosRecopilados || []).map((d) => ({ ...DATO_NUEVO_DEFAULT, ...d })),
    excepciones: data.excepciones || '',
    requiereConsentimiento: data.requiereConsentimiento || '',
    poblacionInterviniente: data.poblacionInterviniente || '',
    cantidadAproxPersonas: data.cantidadAproxPersonas || '',
    partesInteresadasInternas: data.partesInteresadasInternas || '',
    anonimizacion: data.anonimizacion || '',
    observacionesFinalidad: data.observacionesFinalidad || '',
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
      ...DATO_NUEVO_DEFAULT,
    };
    setFormData((prev) => ({
      ...prev,
      datosRecopilados: [...prev.datosRecopilados, nuevoDato],
    }));
  };

  // Mismo componente compacto que ya usa Step8_Adicionales.jsx para SÍ/NO/sin-responder.
  const siNoSelect = (value, onChange) => (
    <select
      value={value}
      onChange={onChange}
      className={`px-2 py-1 rounded border text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none ${
        value === 'SI'
          ? 'border-green-400 bg-green-50 text-green-700'
          : value === 'NO'
          ? 'border-red-300 bg-red-50 text-red-700'
          : 'border-gray-300'
      }`}
    >
      {SI_NO.map((o) => (
        <option key={o} value={o}>
          {o === '' ? '--' : o === 'SI' ? 'SÍ' : 'NO'}
        </option>
      ))}
    </select>
  );

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
        <CampoObservacion campo="finalidad" {...subsanacion} />
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
        <CampoObservacion campo="baseLegal" {...subsanacion} />
      </div>

      {/* Campos adicionales de la hoja FINALIDAD (todos opcionales) */}
      <OptionalSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excepciones aplicables
            </label>
            <textarea
              value={formData.excepciones}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excepciones: e.target.value }))
              }
              placeholder="Ej: Excepción por interés público, seguridad nacional, etc."
              rows="2"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Requiere consentimiento del titular?
            </label>
            {siNoSelect(formData.requiereConsentimiento, (e) =>
              setFormData((prev) => ({ ...prev, requiereConsentimiento: e.target.value }))
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Se aplica anonimización?
            </label>
            {siNoSelect(formData.anonimizacion, (e) =>
              setFormData((prev) => ({ ...prev, anonimizacion: e.target.value }))
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Población interviniente
            </label>
            <input
              type="text"
              value={formData.poblacionInterviniente}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, poblacionInterviniente: e.target.value }))
              }
              placeholder="Ej: Pacientes, funcionarios, estudiantes..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad aproximada de personas
            </label>
            <input
              type="number"
              min="0"
              value={formData.cantidadAproxPersonas}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cantidadAproxPersonas: e.target.value }))
              }
              placeholder="Ej: 500"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partes interesadas internas
            </label>
            <input
              type="text"
              value={formData.partesInteresadasInternas}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, partesInteresadasInternas: e.target.value }))
              }
              placeholder="Ej: Recursos Humanos, TI, Dirección Médica..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observacionesFinalidad}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, observacionesFinalidad: e.target.value }))
              }
              rows="2"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </div>
      </OptionalSection>

      {/* Tabla de datos recopilados */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Datos Personales Recopilados
        </h3>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full min-w-[1400px]">
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Fuente
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Uso
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Menores de edad
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Discapacidad
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Funcionarias
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Vulnerabilidad
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Vigencia
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
                    colSpan="11"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <p>No hay datos registrados</p>
                  </td>
                </tr>
              ) : (
                formData.datosRecopilados.map((dato, idx) => (
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
                      <CampoObservacion campo={`datosRecopilados[${idx}].nombre`} {...subsanacion} />
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
                      <CampoObservacion campo={`datosRecopilados[${idx}].tipo`} {...subsanacion} />
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
                      <CampoObservacion campo={`datosRecopilados[${idx}].obligatorio`} {...subsanacion} />
                    </td>

                    {/* Fuente */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={dato.fuente}
                        onChange={(e) => actualizarDato(dato.id, 'fuente', e.target.value)}
                        placeholder="Ej: Formulario de ingreso"
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </td>

                    {/* Uso */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={dato.uso}
                        onChange={(e) => actualizarDato(dato.id, 'uso', e.target.value)}
                        placeholder="Ej: Identificación del titular"
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </td>

                    {/* ¿Involucra personas menores de edad? */}
                    <td className="px-4 py-3">
                      {siNoSelect(dato.personasMenores, (e) =>
                        actualizarDato(dato.id, 'personasMenores', e.target.value)
                      )}
                    </td>

                    {/* ¿Involucra personas con discapacidad? */}
                    <td className="px-4 py-3">
                      {siNoSelect(dato.personasDiscapacidad, (e) =>
                        actualizarDato(dato.id, 'personasDiscapacidad', e.target.value)
                      )}
                    </td>

                    {/* ¿Involucra personas funcionarias? */}
                    <td className="px-4 py-3">
                      {siNoSelect(dato.personasFuncionarias, (e) =>
                        actualizarDato(dato.id, 'personasFuncionarias', e.target.value)
                      )}
                    </td>

                    {/* ¿Involucra personas en estado de vulnerabilidad? */}
                    <td className="px-4 py-3">
                      {siNoSelect(dato.personasVulnerables, (e) =>
                        actualizarDato(dato.id, 'personasVulnerables', e.target.value)
                      )}
                    </td>

                    {/* Vigencia */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={dato.vigencia}
                        onChange={(e) => actualizarDato(dato.id, 'vigencia', e.target.value)}
                        placeholder="Ej: 5 años"
                        className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
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