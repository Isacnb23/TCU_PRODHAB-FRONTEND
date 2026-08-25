import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, XCircle, CheckCircle2, Send } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';
import { generarExcelProtocolo } from '../../utils/excelGenerator';
import logoPrograma from '../../assets/logos/Logo_Agencia_Azul_Dorado_PNG.png';

/**
 * Step9_Revision.jsx - Paso 9: Revisión Final y Exportación
 *
 * Recibe el formData completo (todos los pasos) y muestra un resumen.
 * El botón "Descargar Excel" solo está disponible cuando estado === 'Aprobado'.
 */

export default function Step9_Revision({ data = {}, onEnviar, puedeEnviar, readOnly, estado, expedienteMeta }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const g = data.step1_general || {};
  const inv = data.step2_inventario || {};
  const am = data.step3_amenazas || {};
  const fin = data.step4_finalidad || {};
  const trans = data.step5_transferencia || {};
  const riesgos = data.step6_riesgos || {};
  const seg = data.step7_seguridad || {};
  const adic = data.step8_adicionales || {};

  const descargarExcel = async () => {
    setIsGenerating(true);
    try {
      await generarExcelProtocolo(data, expedienteMeta, logoPrograma);
    } catch (error) {
      alert('❌ Error al generar el protocolo: ' + error.message);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calcular completitud de los 8 pasos de contenido
  const checks = [
    { label: 'Información General', ok: !!(g.entidad && g.nombreBD && g.gestorBD) },
    { label: 'Inventario de BDs', ok: (inv.bases?.length ?? 0) > 0 },
    {
      label: 'Evaluación de Amenazas',
      ok: Object.keys(am.respuestas ?? {}).length === 20,
    },
    { label: 'Finalidad y Datos', ok: !!(fin.finalidad && fin.baseLegal) },
    {
      label: 'Transferencias',
      ok:
        trans.realizaTransferencias === false ||
        (trans.transferencias?.length ?? 0) > 0,
    },
    { label: 'Gestión de Riesgos', ok: (riesgos.riesgos?.length ?? 0) > 0 },
    { label: 'Medidas de Seguridad', ok: (seg.controles?.length ?? 0) > 0 },
    { label: 'Seguimiento y Control', ok: true },
  ];

  const completados = checks.filter((c) => c.ok).length;
  const pct = Math.round((completados / checks.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción */}
      <InfoBanner
        Icon={CheckCircle2}
        title="Paso 9: Revisión Final y Exportación"
        description="Revisa toda la información ingresada y descarga tu protocolo en formato Excel."
      />

      {/* Barra de completitud */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">
            Completitud del formulario
          </span>
          <span className="text-lg font-bold text-primary-600">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-green-500 to-primary-600"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completados} de {checks.length} secciones completas
        </p>
      </div>

      {/* Checklist de pasos */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900">
          Estado por sección
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {checks.map((c) => (
            <div
              key={c.label}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                c.ok
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              {c.ok ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
              <span className="text-xs font-medium text-gray-800">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Paso 1 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-bold text-gray-700 uppercase mb-3">
          Paso 1 — Información General
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
          <div>
            <span className="font-medium">Entidad:</span>{' '}
            {g.entidad || '—'}
          </div>
          <div>
            <span className="font-medium">Base de datos:</span>{' '}
            {g.nombreBD || '—'}
          </div>
          <div>
            <span className="font-medium">Gestor BD:</span>{' '}
            {g.gestorBD || '—'} {g.versionBD ? `(${g.versionBD})` : ''}
          </div>
          <div>
            <span className="font-medium">Año:</span> {g.ano || '—'}
          </div>
          <div>
            <span className="font-medium">Responsable:</span>{' '}
            {g.responsable || '—'}
          </div>
          <div>
            <span className="font-medium">Email:</span> {g.contacto || '—'}
          </div>
          {g.area && (
            <div>
              <span className="font-medium">Área:</span> {g.area}
            </div>
          )}
          {g.alojamiento && (
            <div>
              <span className="font-medium">Alojamiento:</span>{' '}
              {g.alojamiento}
            </div>
          )}
          {g.cantidadUsuarios && (
            <div>
              <span className="font-medium">Usuarios:</span>{' '}
              {g.cantidadUsuarios}
            </div>
          )}
          {g.fechaCreacion && (
            <div>
              <span className="font-medium">Fecha creación BD:</span>{' '}
              {g.fechaCreacion}
            </div>
          )}
          <div>
            <span className="font-medium">Diagrama ER:</span>{' '}
            {g.diagramaER ? `✅ ${g.diagramaER.name}` : '⏳ No cargado'}
          </div>
        </div>
      </div>

      {/* Resumen Pasos 2–7 */}
      {[
        {
          titulo: 'Paso 2 — Inventario de Bases de Datos',
          items: [
            `${inv.bases?.length ?? 0} base(s) de datos registrada(s)`,
            `Gestores únicos: ${
              new Set((inv.bases ?? []).map((b) => b.gestor).filter(Boolean))
                .size
            }`,
          ],
        },
        {
          titulo: 'Paso 3 — Evaluación de Amenazas',
          items: [
            `${Object.keys(am.respuestas ?? {}).length}/20 preguntas respondidas`,
          ],
        },
        {
          titulo: 'Paso 4 — Finalidad y Datos',
          items: [
            `Finalidad: ${fin.finalidad ? '✅' : '⏳'}`,
            `Base legal: ${fin.baseLegal || '—'}`,
            `Datos recopilados: ${fin.datosRecopilados?.length ?? 0}`,
          ],
        },
        {
          titulo: 'Paso 5 — Transferencias',
          items: [
            `¿Realiza transferencias?: ${
              trans.realizaTransferencias ? 'SÍ' : 'NO'
            }`,
            trans.realizaTransferencias
              ? `Transferencias registradas: ${
                  trans.transferencias?.length ?? 0
                }`
              : null,
          ].filter(Boolean),
        },
        {
          titulo: 'Paso 6 — Gestión de Riesgos',
          items: [
            `${riesgos.riesgos?.length ?? 0} riesgo(s) identificado(s)`,
          ],
        },
        {
          titulo: 'Paso 7 — Medidas de Seguridad',
          items: [
            `${seg.controles?.length ?? 0} control(es) registrado(s)`,
            `Implementados: ${
              (seg.controles ?? []).filter(
                (c) => c.estado === 'Implementado'
              ).length
            }`,
          ],
        },
        {
          titulo: 'Paso 8 — Seguimiento y Control',
          items: [
            `Vulneraciones: ${adic.vulneraciones?.length ?? 0}`,
            `Actividades (plan): ${adic.planAccion?.length ?? 0}`,
            `Docs. aprobados: ${
              (adic.controlDocumentos ?? []).filter(
                (d) => d.aprobado === 'SI'
              ).length
            }/7`,
          ],
        },
      ].map((seccion) => (
        <div
          key={seccion.titulo}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">
            {seccion.titulo}
          </p>
          <ul className="space-y-1">
            {seccion.items.map((item) => (
              <li key={item} className="text-xs text-gray-600 flex gap-2">
                <span className="text-gray-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Botón descargar — solo disponible una vez Aprobado */}
      {estado === 'Aprobado' ? (
        <motion.button
          whileHover={!isGenerating ? { scale: 1.02 } : {}}
          whileTap={!isGenerating ? { scale: 0.98 } : {}}
          onClick={descargarExcel}
          disabled={isGenerating}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white transition-all ${
            isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Generando Excel...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar Protocolo (Excel)
            </>
          )}
        </motion.button>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          El protocolo podrá descargarse en formato Excel una vez que el expediente sea <strong>aprobado</strong> por PRODHAB.
        </div>
      )}

      {/* Botón enviar a PRODHAB */}
      {readOnly ? (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          Expediente ya enviado
        </button>
      ) : (
        <div>
          <motion.button
            whileHover={puedeEnviar ? { scale: 1.02 } : {}}
            whileTap={puedeEnviar ? { scale: 0.98 } : {}}
            onClick={onEnviar}
            disabled={!puedeEnviar}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white transition-all ${
              puedeEnviar ? 'bg-[#1B2A4A] hover:bg-[#243761]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            {estado === 'RequiereSubsanacion' ? 'Reenviar a PRODHAB' : 'Enviar a PRODHAB'}
          </motion.button>
          {!puedeEnviar && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              Completa todos los pasos obligatorios para poder enviar.
            </p>
          )}
        </div>
      )}

      {/* Contacto PRODHAB */}
      <div className="bg-primary-50 border border-primary-300 rounded-lg p-4 text-xs text-primary-800">
        <p className="font-semibold mb-1">📞 Soporte PRODHAB</p>
        <p>
          <strong>Supervisora:</strong> MSc. Wendy Rivera Román
        </p>
        <p>
          <strong>Email:</strong> rrhh@prodhab.go.cr |{' '}
          <strong>Tel:</strong> 2234-0189 ext 115
        </p>
      </div>
    </motion.div>
  );
}