import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, ClipboardList } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';

/**
 * Step8_Adicionales.jsx - Paso 8: Seguimiento y Control
 *
 * Tab 1: Vulneraciones (sheet VULNERACIONES del Excel)
 * Tab 2: Plan de Acción General (sheet PLAN DE ACCION GENERAL)
 * Tab 3: Control de Documentos (sheet CONTROL DE DOCUMENTOS - 7 filas fijas)
 *
 * Todos los campos son opcionales. Artículos: Art. 44
 */

const DOCUMENTOS_CONTROL = [
  'Consentimiento informado',
  'Rotulación',
  'Control de usuarios',
  'Medidas de seguridad',
  'Ejercicio derechos: Acceso y Rectificación',
  'Vigencia del tratamiento de datos personales',
  'Formulario de recolección y/o recopilación de la información',
];

const ESTADOS_PLAN = ['Pendiente', 'En proceso', 'Finalizada'];

const SI_NO = ['', 'SI', 'NO'];

function initControlDocumentos(existing) {
  return DOCUMENTOS_CONTROL.map((nombre, idx) =>
    existing?.[idx] ?? {
      nombre,
      seRequiere: '',
      realizado: '',
      revisado: '',
      aprobado: '',
      version: '',
      actualizacion: '',
      observaciones: '',
    }
  );
}

export default function Step8_Adicionales({ data = {}, onChange }) {
  const [tabActivo, setTabActivo] = useState(0);

  const [vulneraciones, setVulneraciones] = useState(data.vulneraciones || []);
  const [planAccion, setPlanAccion] = useState(data.planAccion || []);
  const [controlDocumentos, setControlDocumentos] = useState(
    initControlDocumentos(data.controlDocumentos)
  );

  // Paso opcional — siempre válido
  useEffect(() => {
    onChange({ vulneraciones, planAccion, controlDocumentos }, true);
  }, [vulneraciones, planAccion, controlDocumentos]);

  // ─── Helpers Vulneraciones ───────────────────────────────────────────────

  const agregarVulneracion = () => {
    setVulneraciones((prev) => [
      ...prev,
      {
        id: Date.now(),
        fechaHallazgo: '',
        nombreIncidente: '',
        descripcion: '',
        datosComprometidos: '',
        accionesCorrectivas: '',
        fechaReporteProdhab: '',
        numeroOficio: '',
        comunicacionPartes: '',
        responsableSeguimiento: '',
        informeFinalCierre: '',
        fechaCierre: '',
        observaciones: '',
      },
    ]);
  };

  const eliminarVulneracion = (id) =>
    setVulneraciones((prev) => prev.filter((v) => v.id !== id));

  const actualizarVulneracion = (id, campo, valor) =>
    setVulneraciones((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [campo]: valor } : v))
    );

  // ─── Helpers Plan de Acción ──────────────────────────────────────────────

  const agregarActividad = () => {
    setPlanAccion((prev) => [
      ...prev,
      {
        id: Date.now(),
        actividades: '',
        duracion: '',
        fechaInicio: '',
        fechaFinal: '',
        coordinacion: '',
        estado: 'Pendiente',
        observaciones: '',
      },
    ]);
  };

  const eliminarActividad = (id) =>
    setPlanAccion((prev) => prev.filter((p) => p.id !== id));

  const actualizarActividad = (id, campo, valor) =>
    setPlanAccion((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );

  // ─── Helpers Control de Documentos ──────────────────────────────────────

  const actualizarDocumento = (idx, campo, valor) => {
    setControlDocumentos((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
  };

  // ─── Tabs ────────────────────────────────────────────────────────────────

  const TABS = [
    { label: 'Vulneraciones', count: vulneraciones.length, color: 'red' },
    { label: 'Plan de Acción', count: planAccion.length, color: 'blue' },
    { label: 'Control de Documentos', count: null, color: 'green' },
  ];

  const badgeClass = {
    red: 'bg-red-100 text-red-700',
    blue: 'bg-primary-100 text-primary-700',
    green: 'bg-green-100 text-green-700',
  };

  const inputBase =
    'w-full px-2 py-1 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none';

  const siNoSelect = (value, onChange) => (
    <select
      value={value}
      onChange={onChange}
      className={`px-2 py-1 rounded border text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none ${
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción */}
      <InfoBanner
        Icon={ClipboardList}
        title="Paso 8: Seguimiento y Control"
        description={
          <>
            Registra vulneraciones, el plan de acción y el estado de los
            documentos requeridos. Todos los campos son{' '}
            <strong>opcionales</strong>.
          </>
        }
      />

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {TABS.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setTabActivo(idx)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                tabActivo === idx
                  ? 'border-primary-600 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    badgeClass[tab.color]
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══ TAB 1: Vulneraciones ═══════════════════════════════════════════ */}
      {tabActivo === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-600">
            Registra cada incidente de seguridad o vulneración de datos
            personales detectada.
          </p>

          {vulneraciones.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border border-dashed border-gray-300 rounded-lg">
              <p className="font-medium">Sin incidentes registrados</p>
              <p className="text-xs mt-1">
                Si no hay vulneraciones, puedes continuar al siguiente paso
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {vulneraciones.map((v, idx) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      Incidente #{idx + 1}
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => eliminarVulneracion(v.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha de hallazgo
                      </label>
                      <input
                        type="date"
                        value={v.fechaHallazgo}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'fechaHallazgo', e.target.value)
                        }
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nombre del incidente
                      </label>
                      <input
                        type="text"
                        value={v.nombreIncidente}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'nombreIncidente', e.target.value)
                        }
                        placeholder="Ej: Acceso no autorizado"
                        className={inputBase}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Descripción del incidente / suceso
                      </label>
                      <textarea
                        value={v.descripcion}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'descripcion', e.target.value)
                        }
                        rows="2"
                        placeholder="Descripción detallada del suceso..."
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Datos personales comprometidos
                      </label>
                      <input
                        type="text"
                        value={v.datosComprometidos}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'datosComprometidos', e.target.value)
                        }
                        placeholder="Tipo de datos afectados"
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha reporte a PRODHAB
                      </label>
                      <input
                        type="date"
                        value={v.fechaReporteProdhab}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'fechaReporteProdhab', e.target.value)
                        }
                        className={inputBase}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Acciones correctivas
                      </label>
                      <textarea
                        value={v.accionesCorrectivas}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'accionesCorrectivas', e.target.value)
                        }
                        rows="2"
                        placeholder="Medidas adoptadas para corregir el incidente..."
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Número de oficio reporte
                      </label>
                      <input
                        type="text"
                        value={v.numeroOficio}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'numeroOficio', e.target.value)
                        }
                        placeholder="Nro. de oficio"
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Responsable de seguimiento
                      </label>
                      <input
                        type="text"
                        value={v.responsableSeguimiento}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'responsableSeguimiento', e.target.value)
                        }
                        placeholder="Nombre del responsable"
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Comunicación partes interesadas
                      </label>
                      {siNoSelect(v.comunicacionPartes, (e) =>
                        actualizarVulneracion(v.id, 'comunicacionPartes', e.target.value)
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Informe final de cierre
                      </label>
                      {siNoSelect(v.informeFinalCierre, (e) =>
                        actualizarVulneracion(v.id, 'informeFinalCierre', e.target.value)
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha cierre del incidente
                      </label>
                      <input
                        type="date"
                        value={v.fechaCierre}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'fechaCierre', e.target.value)
                        }
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Observaciones
                      </label>
                      <input
                        type="text"
                        value={v.observaciones}
                        onChange={(e) =>
                          actualizarVulneracion(v.id, 'observaciones', e.target.value)
                        }
                        className={inputBase}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarVulneracion}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar Vulneración
          </motion.button>
        </motion.div>
      )}

      {/* ═══ TAB 2: Plan de Acción ══════════════════════════════════════════ */}
      {tabActivo === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-600">
            Registra las actividades del plan de acción para mejorar la
            protección de datos personales.
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full min-w-[860px]">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-8">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">
                    Actividad
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-24">
                    Duración
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-32">
                    F. Inicio
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-32">
                    F. Final
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">
                    Coordinación
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-32">
                    Estado
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">
                    Observaciones
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 w-10">
                    —
                  </th>
                </tr>
              </thead>
              <tbody>
                {planAccion.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      No hay actividades registradas
                    </td>
                  </tr>
                ) : (
                  planAccion.map((p, idx) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 text-xs text-gray-500 text-center">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={p.actividades}
                          onChange={(e) =>
                            actualizarActividad(p.id, 'actividades', e.target.value)
                          }
                          placeholder="Descripción de la actividad"
                          className={inputBase}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={p.duracion}
                          onChange={(e) =>
                            actualizarActividad(p.id, 'duracion', e.target.value)
                          }
                          placeholder="Ej: 2 sem"
                          className={inputBase}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={p.fechaInicio}
                          onChange={(e) =>
                            actualizarActividad(p.id, 'fechaInicio', e.target.value)
                          }
                          className={inputBase}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={p.fechaFinal}
                          onChange={(e) =>
                            actualizarActividad(p.id, 'fechaFinal', e.target.value)
                          }
                          className={inputBase}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={p.coordinacion}
                          onChange={(e) =>
                            actualizarActividad(p.id, 'coordinacion', e.target.value)
                          }
                          placeholder="Responsable"
                          className={inputBase}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={p.estado}
                          onChange={(e) =>
                            actualizarActividad(p.id, 'estado', e.target.value)
                          }
                          className={`${inputBase} ${
                            p.estado === 'Finalizada'
                              ? 'border-green-400 bg-green-50 text-green-700'
                              : p.estado === 'En proceso'
                              ? 'border-primary-400 bg-primary-50 text-primary-700'
                              : ''
                          }`}
                        >
                          {ESTADOS_PLAN.map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={p.observaciones}
                          onChange={(e) =>
                            actualizarActividad(p.id, 'observaciones', e.target.value)
                          }
                          className={inputBase}
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => eliminarActividad(p.id)}
                          className="text-red-500 hover:text-red-700"
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

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarActividad}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar Actividad
          </motion.button>

          {/* Resumen estados */}
          {planAccion.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {ESTADOS_PLAN.map((estado) => {
                const count = planAccion.filter((p) => p.estado === estado).length;
                const colors = {
                  Pendiente: 'bg-gray-50 border-gray-300 text-gray-700',
                  'En proceso': 'bg-primary-50 border-primary-300 text-primary-700',
                  Finalizada: 'bg-green-50 border-green-300 text-green-700',
                };
                return (
                  <div
                    key={estado}
                    className={`border rounded-lg p-3 text-center ${colors[estado]}`}
                  >
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs">{estado}</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ TAB 3: Control de Documentos ══════════════════════════════════ */}
      {tabActivo === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-600">
            Verifica el estado de los 7 documentos requeridos por PRODHAB.
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">
                    Documento
                  </th>
                  {['Se requiere', 'Realizado', 'Revisado', 'Aprobado'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-center text-xs font-semibold text-gray-700 w-24"
                      >
                        {h}
                      </th>
                    )
                  )}
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-20">
                    Versión
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-32">
                    Actualización
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {controlDocumentos.map((doc, idx) => (
                  <tr
                    key={doc.nombre}
                    className={`border-b border-gray-200 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-3 text-xs font-medium text-gray-800">
                      {idx + 1}. {doc.nombre}
                    </td>
                    {['seRequiere', 'realizado', 'revisado', 'aprobado'].map(
                      (campo) => (
                        <td key={campo} className="px-3 py-3 text-center">
                          {siNoSelect(doc[campo], (e) =>
                            actualizarDocumento(idx, campo, e.target.value)
                          )}
                        </td>
                      )
                    )}
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={doc.version}
                        onChange={(e) =>
                          actualizarDocumento(idx, 'version', e.target.value)
                        }
                        placeholder="v1.0"
                        className={inputBase}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="date"
                        value={doc.actualizacion}
                        onChange={(e) =>
                          actualizarDocumento(idx, 'actualizacion', e.target.value)
                        }
                        className={inputBase}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={doc.observaciones}
                        onChange={(e) =>
                          actualizarDocumento(idx, 'observaciones', e.target.value)
                        }
                        className={inputBase}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen de control */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { campo: 'seRequiere', label: 'Requeridos' },
              { campo: 'realizado', label: 'Realizados' },
              { campo: 'revisado', label: 'Revisados' },
              { campo: 'aprobado', label: 'Aprobados' },
            ].map(({ campo, label }) => {
              const count = controlDocumentos.filter(
                (d) => d[campo] === 'SI'
              ).length;
              return (
                <div
                  key={campo}
                  className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-center"
                >
                  <p className="text-xl font-bold text-primary-700">
                    {count}/7
                  </p>
                  <p className="text-xs text-primary-600">{label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
