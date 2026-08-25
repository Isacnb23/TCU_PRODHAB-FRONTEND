import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Database } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';
import StepSummary from '../Common/StepSummary';
import CampoObservacion from '../Wizard/CampoObservacion';

/**
 * Step2_Inventario.jsx - Paso 2: Inventario de Bases de Datos
 * 
 * Campos incluidos:
 * - Tabla dinámica de bases de datos
 * - Nombre BD, Descripción, Gestor, Versión, Ubicación, Tipo
 * - Agregar/eliminar filas
 * - Validaciones
 * 
 * Artículos del Reglamento: Art. 27, 32
 */

const GESTORES_BD = [
  'MySQL',
  'PostgreSQL',
  'Oracle',
  'SQL Server',
  'MongoDB',
  'MariaDB',
  'SQLite',
  'Otro',
];

const TIPOS_BD = [
  'Relacional',
  'NoSQL',
  'Documental',
  'Graph',
  'Otro',
];

/**
 * Opciones de ubicación. "Otro..." habilita un campo de texto libre.
 */
const UBICACIONES = [
  'Servidor local',
  'Nube pública (AWS)',
  'Nube pública (Azure)',
  'Nube pública (GCP)',
  'Nube híbrida',
  'Railway',
  'Vercel',
  'Otro...',
];
const UBICACIONES_FIJAS = UBICACIONES.slice(0, -1); // sin "Otro..."

export default function Step2_Inventario({ data = {}, onChange, subsanacion }) {
  const [bases, setBases] = useState(data.bases || []);
  const [errors, setErrors] = useState({});
  // Filas cuyo campo Ubicación está en modo "Otro..." (texto libre)
  const [ubicOtro, setUbicOtro] = useState({});

  // ¿La fila usa una ubicación personalizada? (modo "Otro...")
  const esUbicOtro = (bd) =>
    !!ubicOtro[bd.id] || (!!bd.ubicacion && !UBICACIONES_FIJAS.includes(bd.ubicacion));

  /**
   * Maneja el dropdown de ubicación (con opción "Otro..." → texto libre)
   */
  const handleUbicacion = (id, valor) => {
    if (valor === 'Otro...') {
      setUbicOtro((prev) => ({ ...prev, [id]: true }));
      actualizarBD(id, 'ubicacion', '');
    } else {
      setUbicOtro((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      actualizarBD(id, 'ubicacion', valor);
    }
  };

  useEffect(() => {
    const isValid =
      bases.length > 0 &&
      bases.every((bd) => bd.nombre.trim() && bd.gestor && bd.tipo);
    onChange({ bases }, isValid);
  }, [bases]);

  /**
   * Agregar nueva fila a la tabla
   */
  const agregarBD = () => {
    const nuevaBD = {
      id: Date.now(),
      nombre: '',
      descripcion: '',
      gestor: '',
      version: '',
      ubicacion: '',
      tipo: '',
    };
    setBases([...bases, nuevaBD]);
  };

  /**
   * Eliminar fila de la tabla
   */
  const eliminarBD = (id) => {
    setBases(bases.filter((bd) => bd.id !== id));
  };

  /**
   * Actualizar campo de una BD
   */
  const actualizarBD = (id, campo, valor) => {
    setBases(
      bases.map((bd) =>
        bd.id === id ? { ...bd, [campo]: valor } : bd
      )
    );
  };

  /**
   * Validar fila
   */
  const validarFila = (bd) => {
    const filErrors = {};
    if (!bd.nombre.trim()) filErrors.nombre = 'Requerido';
    if (!bd.gestor) filErrors.gestor = 'Requerido';
    if (!bd.tipo) filErrors.tipo = 'Requerido';
    return filErrors;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción */}
      <InfoBanner
        Icon={Database}
        title="Paso 2: Inventario de Bases de Datos"
        description="Registra todas las bases de datos que contienen datos personales."
      />

      {/* Tabla de inventario */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          {/* Encabezados */}
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Nombre BD <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Gestor <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Versión
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Tipo <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Filas dinámicas */}
          <tbody>
            {bases.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  <p>No hay bases de datos registradas</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Agrega una haciendo clic en el botón "Agregar BD"
                  </p>
                </td>
              </tr>
            ) : (
              bases.map((bd, idx) => (
                <motion.tr
                  key={bd.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  {/* Nombre BD */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={bd.nombre}
                      onChange={(e) =>
                        actualizarBD(bd.id, 'nombre', e.target.value)
                      }
                      placeholder="Ej: Pacientes"
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        errors[`${bd.id}_nombre`]
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:outline-none`}
                    />
                    <CampoObservacion campo={`bases[${idx}].nombre`} {...subsanacion} />
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={bd.descripcion}
                      onChange={(e) =>
                        actualizarBD(bd.id, 'descripcion', e.target.value)
                      }
                      placeholder="Datos de pacientes..."
                      className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <CampoObservacion campo={`bases[${idx}].descripcion`} {...subsanacion} />
                  </td>

                  {/* Gestor BD */}
                  <td className="px-4 py-3">
                    <select
                      value={bd.gestor}
                      onChange={(e) =>
                        actualizarBD(bd.id, 'gestor', e.target.value)
                      }
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        errors[`${bd.id}_gestor`]
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:outline-none`}
                    >
                      <option value="">--</option>
                      {GESTORES_BD.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <CampoObservacion campo={`bases[${idx}].gestor`} {...subsanacion} />
                  </td>

                  {/* Versión */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={bd.version}
                      onChange={(e) =>
                        actualizarBD(bd.id, 'version', e.target.value)
                      }
                      placeholder="8.0.32"
                      className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <CampoObservacion campo={`bases[${idx}].version`} {...subsanacion} />
                  </td>

                  {/* Ubicación (dropdown con opción "Otro...") */}
                  <td className="px-4 py-3">
                    <select
                      value={esUbicOtro(bd) ? 'Otro...' : bd.ubicacion || ''}
                      onChange={(e) => handleUbicacion(bd.id, e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="">--</option>
                      {UBICACIONES.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    {esUbicOtro(bd) && (
                      <input
                        type="text"
                        value={bd.ubicacion}
                        onChange={(e) =>
                          actualizarBD(bd.id, 'ubicacion', e.target.value)
                        }
                        placeholder="Especifica la ubicación..."
                        className="mt-1 w-full px-2 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    )}
                    <CampoObservacion campo={`bases[${idx}].ubicacion`} {...subsanacion} />
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    <select
                      value={bd.tipo}
                      onChange={(e) =>
                        actualizarBD(bd.id, 'tipo', e.target.value)
                      }
                      className={`w-full px-2 py-1 rounded border text-sm ${
                        errors[`${bd.id}_tipo`]
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      } focus:ring-2 focus:ring-primary-500 focus:outline-none`}
                    >
                      <option value="">--</option>
                      {TIPOS_BD.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <CampoObservacion campo={`bases[${idx}].tipo`} {...subsanacion} />
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 text-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => eliminarBD(bd.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Eliminar"
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
        onClick={agregarBD}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
      >
        <Plus className="w-4 h-4" />
        Agregar BD
      </motion.button>

      {/* Resumen */}
      <StepSummary
        items={[
          <>Bases de datos registradas: <strong>{bases.length}</strong></>,
          <>
            Completadas:{' '}
            <strong>
              {bases.filter((bd) => bd.nombre && bd.gestor && bd.tipo).length}
            </strong>
          </>,
          <>
            Gestores BD únicos:{' '}
            <strong>
              {new Set(bases.map((bd) => bd.gestor).filter(Boolean)).size}
            </strong>
          </>,
        ]}
      />
    </motion.div>
  );
}