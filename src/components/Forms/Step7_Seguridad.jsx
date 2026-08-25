import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Shield, Lock, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';
import StepSummary from '../Common/StepSummary';
import CampoObservacion from '../Wizard/CampoObservacion';

/**
 * Step7_Seguridad.jsx - Paso 7: Medidas de Seguridad y Controles
 * 
 * Campos:
 * - Tabla de controles de seguridad
 * - Tipo: Técnico, Administrativo, Físico
 * - Descripción de la medida
 * - Estado: Implementado, Planificado, No aplicable
 * - Responsable
 * 
 * Artículos del Reglamento: Art. 36, 44 j)
 */

const TIPOS_CONTROL = [
  'Técnico',
  'Administrativo',
  'Físico',
  'Operacional',
];

const ESTADOS_CONTROL = [
  'Implementado',
  'Planificado',
  'Parcialmente implementado',
  'No aplicable',
];

const CONTROLES_SUGERIDOS = [
  {
    tipo: 'Técnico',
    descripcion: 'Encriptación de datos en tránsito (SSL/TLS)',
  },
  {
    tipo: 'Técnico',
    descripcion: 'Encriptación de datos en reposo',
  },
  {
    tipo: 'Técnico',
    descripcion: 'Firewalls y sistemas de detección de intrusiones',
  },
  {
    tipo: 'Técnico',
    descripcion: 'Autenticación multifactor (MFA)',
  },
  {
    tipo: 'Técnico',
    descripcion: 'Copias de seguridad automáticas',
  },
  {
    tipo: 'Administrativo',
    descripcion: 'Política de control de acceso',
  },
  {
    tipo: 'Administrativo',
    descripcion: 'Procedimientos de clasificación de datos',
  },
  {
    tipo: 'Administrativo',
    descripcion: 'Capacitación en seguridad de datos',
  },
  {
    tipo: 'Administrativo',
    descripcion: 'Plan de respuesta ante incidentes',
  },
  {
    tipo: 'Administrativo',
    descripcion: 'Auditorías de seguridad periódicas',
  },
  {
    tipo: 'Físico',
    descripcion: 'Control de acceso físico a servidores',
  },
  {
    tipo: 'Físico',
    descripcion: 'Sistemas de vigilancia (CCTV)',
  },
  {
    tipo: 'Físico',
    descripcion: 'Custodia de equipos y dispositivos',
  },
];

export default function Step7_Seguridad({ data = {}, onChange, subsanacion }) {
  const [controles, setControles] = useState(data.controles || []);
  const [mostrarSugeridos, setMostrarSugeridos] = useState(false);

  useEffect(() => {
    const isValid =
      controles.length > 0 &&
      controles.every((c) => c.tipo && c.descripcion.trim() && c.estado);
    onChange({ controles }, isValid);
  }, [controles]);

  /**
   * Agregar nuevo control
   */
  const agregarControl = () => {
    const nuevoControl = {
      id: Date.now(),
      tipo: '',
      descripcion: '',
      estado: '',
      responsable: '',
    };
    setControles([...controles, nuevoControl]);
  };

  /**
   * Agregar control sugerido
   */
  const agregarControlSugerido = (sugerido) => {
    const control = {
      id: Date.now(),
      tipo: sugerido.tipo,
      descripcion: sugerido.descripcion,
      estado: 'Implementado',
      responsable: '',
    };
    setControles([...controles, control]);
    setMostrarSugeridos(false);
  };

  /**
   * Eliminar control
   */
  const eliminarControl = (id) => {
    setControles(controles.filter((c) => c.id !== id));
  };

  /**
   * Actualizar control
   */
  const actualizarControl = (id, campo, valor) => {
    setControles(
      controles.map((c) =>
        c.id === id ? { ...c, [campo]: valor } : c
      )
    );
  };

  /**
   * Estadísticas
   */
  const estadisticas = {
    total: controles.length,
    tecnicos: controles.filter((c) => c.tipo === 'Técnico').length,
    administrativos: controles.filter(
      (c) => c.tipo === 'Administrativo'
    ).length,
    fisicos: controles.filter((c) => c.tipo === 'Físico').length,
    implementados: controles.filter(
      (c) => c.estado === 'Implementado'
    ).length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción */}
      <InfoBanner
        Icon={Lock}
        title="Paso 7: Medidas de Seguridad y Controles"
        description="Documenta todas las medidas técnicas, administrativas y físicas que implementas para proteger los datos personales."
      />

      {/* Botones de acción */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={agregarControl}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Agregar Control
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMostrarSugeridos(!mostrarSugeridos)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {mostrarSugeridos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {mostrarSugeridos ? 'Ocultar' : 'Ver'} Sugeridos
        </motion.button>
      </div>

      {/* Controles sugeridos */}
      {mostrarSugeridos && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4"
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-purple-900 mb-3">
            <Lightbulb className="w-4 h-4" />
            Controles Recomendados (haz clic para agregar)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CONTROLES_SUGERIDOS.map((sugerido, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => agregarControlSugerido(sugerido)}
                className="text-left px-3 py-2 bg-white border border-purple-300 rounded hover:bg-purple-100 transition-colors"
              >
                <p className="text-xs font-semibold text-purple-700">
                  {sugerido.tipo}
                </p>
                <p className="text-xs text-gray-700">{sugerido.descripcion}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabla de controles */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          {/* Encabezados */}
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Tipo <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Descripción <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Estado <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Responsable
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Filas */}
          <tbody>
            {controles.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  <p>No hay controles registrados</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Agrega controles o usa los sugeridos
                  </p>
                </td>
              </tr>
            ) : (
              controles.map((control, idx) => (
                <motion.tr
                  key={control.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  {/* Tipo */}
                  <td className="px-4 py-3">
                    <select
                      value={control.tipo}
                      onChange={(e) =>
                        actualizarControl(
                          control.id,
                          'tipo',
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="">--</option>
                      {TIPOS_CONTROL.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <CampoObservacion campo={`controles[${idx}].tipo`} {...subsanacion} />
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={control.descripcion}
                      onChange={(e) =>
                        actualizarControl(
                          control.id,
                          'descripcion',
                          e.target.value
                        )
                      }
                      placeholder="Ej: Encriptación SSL/TLS"
                      className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <CampoObservacion campo={`controles[${idx}].descripcion`} {...subsanacion} />
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <select
                      value={control.estado}
                      onChange={(e) =>
                        actualizarControl(
                          control.id,
                          'estado',
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="">--</option>
                      {ESTADOS_CONTROL.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                    <CampoObservacion campo={`controles[${idx}].estado`} {...subsanacion} />
                  </td>

                  {/* Responsable */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={control.responsable}
                      onChange={(e) =>
                        actualizarControl(
                          control.id,
                          'responsable',
                          e.target.value
                        )
                      }
                      placeholder="Nombre"
                      className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <CampoObservacion campo={`controles[${idx}].responsable`} {...subsanacion} />
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 text-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => eliminarControl(control.id)}
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

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-primary-50 border border-primary-300 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-primary-700">{estadisticas.total}</p>
          <p className="text-xs text-primary-600">Total</p>
        </div>
        <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-purple-700">
            {estadisticas.tecnicos}
          </p>
          <p className="text-xs text-purple-600">Técnicos</p>
        </div>
        <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-green-700">
            {estadisticas.administrativos}
          </p>
          <p className="text-xs text-green-600">Admin</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-yellow-700">
            {estadisticas.fisicos}
          </p>
          <p className="text-xs text-yellow-600">Físicos</p>
        </div>
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-red-700">
            {estadisticas.implementados}
          </p>
          <p className="text-xs text-red-600">Impl.</p>
        </div>
      </div>

      {/* Resumen */}
      <StepSummary
        items={[
          <>Total de controles: <strong>{estadisticas.total}</strong></>,
          'Cobertura: Técnica, Administrativa, Física',
          <>Implementados: <strong>{estadisticas.implementados}</strong></>,
        ]}
      />
    </motion.div>
  );
}