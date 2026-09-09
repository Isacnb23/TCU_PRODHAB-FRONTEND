import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ShieldAlert, Network, ListChecks, Users2, Building2 } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';
import CampoObservacion from '../Wizard/CampoObservacion';

/**
 * Step3_Amenazas.jsx - Paso 3: Evaluación de Amenazas
 *
 * Metodología OFICIAL de PRODHAB: formato de Douwe Korff & Marie Georges
 * (Manual del DPD), tal como aparece en la hoja "EVAL. AMENAZAS" de la
 * plantilla oficial. 4 ámbitos × 5 preguntas = 20 preguntas totales,
 * respuesta SÍ/NO.
 *
 * Puntuación (fórmulas reales de la plantilla):
 * - Por ámbito: cantidad de respuestas "SÍ" (0-5) →
 *     0-1 = Bajo · 2-3 = Medio · 4-5 = Alto
 * - Global: suma de las 4 cantidades por ámbito (0-20) →
 *     ≤5 = Bajo · ≤8 = Medio · >8 = Alto
 *   (fórmula real: =IF(total<=5,"Bajo",IF(total<=8,"Medio","Alto")))
 *
 * Artículos del Reglamento: Art. 34, 35
 */

const AMBITOS = [
  {
    id: 1,
    letra: 'A',
    nombre: 'Red y recursos técnicos',
    icono: Network,
    preguntas: [
      '¿Hay alguna parte del tratamiento de datos personales que se realice por internet?',
      '¿Es posible dar acceso a un sistema interno de tratamiento de datos personales por internet (por ejemplo, a algunos usuarios o grupos de interés)?',
      '¿El sistema de tratamiento de datos personales está interconectado a otro sistema o servicio TIC externo o interno (de su organización)?',
      '¿Pueden los individuos no autorizados acceder fácilmente al entorno de tratamiento de datos?',
      '¿Se diseña, implementa o mantiene el sistema de tratamiento de datos personales sin seguir las mejores prácticas?',
    ],
  },
  {
    id: 2,
    letra: 'B',
    nombre: 'Procesos y procedimientos',
    icono: ListChecks,
    preguntas: [
      '¿Los roles y responsabilidades con respecto a tratamiento de datos personales son superficiales o no están claramente definidos?',
      '¿El uso aceptable de la red, sistema y recursos físicos a nivel interno de la organización es ambiguo o está definido de forma poco clara?',
      '¿Se permite que los empleados aporten y usen sus propias herramientas para conectarse al sistema de tratamiento de datos personales?',
      '¿Se permite a los empleados transferir, almacenar o realizar otro tipo de tratamiento de datos personales fuera de las instalaciones de la organización?',
      '¿Pueden llevarse a cabo actividades de tratamiento de datos personales sin crear archivos de acceso?',
    ],
  },
  {
    id: 3,
    letra: 'C',
    nombre: 'Partes y personas involucradas',
    icono: Users2,
    preguntas: [
      '¿El tratamiento de datos personales es llevado a cabo por un número no definido de empleados?',
      '¿Alguna parte de la operación de tratamiento de datos la lleva a cabo un contratista/tercero (encargado de datos)?',
      '¿Las obligaciones de las partes/personas involucradas en el tratamiento de datos personales son ambiguas o no son del todo claras?',
      '¿El personal que participa en el tratamiento de datos personales no está familiarizado con asuntos de seguridad de la información?',
      '¿Las personas/partes involucradas en la operación de tratamiento de datos olvidan almacenar o destruir de forma segura datos personales?',
    ],
  },
  {
    id: 4,
    letra: 'D',
    nombre: 'Sector de negocio y escala',
    icono: Building2,
    preguntas: [
      '¿Considera que su sector de negocio es propenso a ciberataques?',
      '¿Ha sufrido su organización algún ciberataque u otro tipo de brecha de seguridad en los dos últimos años?',
      '¿Ha recibido notificaciones o quejas con respecto a la seguridad del sistema TI (utilizado para el tratamiento de datos personales) durante el último año?',
      '¿Una operación de tratamiento implica a un amplio volumen de individuos o datos personales?',
      '¿Existen mejores prácticas de seguridad específicas para su sector de negocio que no se hayan seguido adecuadamente?',
    ],
  },
];

const TOTAL_PREGUNTAS = AMBITOS.length * 5; // 20

// Nivel por ámbito (cantidad de "sí" 0-5): 0-1 Bajo · 2-3 Medio · 4-5 Alto
function nivelAmbito(cantidadSi) {
  if (cantidadSi <= 1) return { nivel: 'Bajo', color: 'bg-green-100 border-green-300 text-green-800' };
  if (cantidadSi <= 3) return { nivel: 'Medio', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' };
  return { nivel: 'Alto', color: 'bg-red-100 border-red-300 text-red-800' };
}

// Nivel global (suma de las 4 cantidades por ámbito, 0-20): fórmula real de la plantilla
// =IF(total<=5,"Bajo",IF(total<=8,"Medio","Alto"))
function nivelGlobal(totalSi) {
  if (totalSi <= 5) return { nivel: 'Bajo', color: 'bg-green-100 border-green-300 text-green-800' };
  if (totalSi <= 8) return { nivel: 'Medio', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' };
  return { nivel: 'Alto', color: 'bg-red-100 border-red-300 text-red-800' };
}

export default function Step3_Amenazas({ data = {}, onChange, subsanacion }) {
  const [respuestas, setRespuestas] = useState(data.respuestas || {});

  const ambitosObservados = new Set(
    (subsanacion?.observaciones || [])
      .map((o) => /^ambito_(\d+)_q_\d+$/.exec(o.campo)?.[1])
      .filter(Boolean)
      .map(Number)
  );
  const [expandidos, setExpandidos] = useState(() => ({
    1: true,
    2: ambitosObservados.has(2),
    3: ambitosObservados.has(3),
    4: ambitosObservados.has(4),
  }));

  useEffect(() => {
    const isValid = Object.keys(respuestas).length === TOTAL_PREGUNTAS;
    onChange({ respuestas }, isValid);
  }, [respuestas]);

  const toggleAmbito = (idAmbito) => {
    setExpandidos((prev) => ({ ...prev, [idAmbito]: !prev[idAmbito] }));
  };

  const cambiarRespuesta = (idAmbito, idPregunta, valor) => {
    const clave = `ambito_${idAmbito}_q_${idPregunta}`;
    setRespuestas((prev) => ({ ...prev, [clave]: valor }));
  };

  const contarSi = (idAmbito) => {
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      if (respuestas[`ambito_${idAmbito}_q_${i}`] === 'si') count++;
    }
    return count;
  };

  const totalRespondidas = Object.keys(respuestas).length;
  const pct = Math.round((totalRespondidas / TOTAL_PREGUNTAS) * 100);

  const totalSiGlobal = AMBITOS.reduce((acc, a) => acc + contarSi(a.id), 0);
  const { nivel: nivelGlobalTexto, color: colorGlobal } = nivelGlobal(totalSiGlobal);
  const evaluacionCompleta = totalRespondidas === TOTAL_PREGUNTAS;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <InfoBanner
        Icon={ShieldAlert}
        title="Paso 3: Evaluación de Amenazas"
        description="Metodología oficial de PRODHAB (formato Douwe Korff & Marie Georges — Manual del DPD). Responda SÍ o NO a cada pregunta en los 4 ámbitos."
      />

      {/* Progreso de completitud */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Preguntas respondidas</span>
          <span className="text-sm font-bold text-primary-600">
            {totalRespondidas} / {TOTAL_PREGUNTAS} ({pct}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          />
        </div>
      </div>

      {/* Nivel global de amenaza — solo cuando está completo, como en la plantilla oficial */}
      {evaluacionCompleta && (
        <div className={`rounded-lg border p-4 flex items-center justify-between ${colorGlobal}`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Evaluación del riesgo global</p>
            <p className="text-sm mt-1">
              Sumatoria global: <strong>{totalSiGlobal}</strong> de 20 respuestas "SÍ"
            </p>
          </div>
          <div className="text-2xl font-bold">{nivelGlobalTexto}</div>
        </div>
      )}

      {/* Ámbitos */}
      <div className="space-y-4">
        {AMBITOS.map((ambito) => {
          const cantidadSi = contarSi(ambito.id);
          const respondidasAmbito = ambito.preguntas.filter(
            (_, idx) => respuestas[`ambito_${ambito.id}_q_${idx + 1}`] !== undefined
          ).length;
          const { nivel, color } = nivelAmbito(cantidadSi);
          const esExpandido = expandidos[ambito.id];
          const IconoAmbito = ambito.icono;

          return (
            <motion.div key={ambito.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleAmbito(ambito.id)}
                className="w-full bg-white px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1B2A4A]/5 text-[#1B2A4A] flex-shrink-0">
                    <IconoAmbito size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {ambito.letra}. {ambito.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {respondidasAmbito}/5 respondidas
                    </p>
                  </div>
                </div>

                {respondidasAmbito === 5 && (
                  <div className={`px-3 py-1 rounded-full border font-bold text-sm mr-4 ${color}`}>
                    {cantidadSi}/5 · {nivel}
                  </div>
                )}

                <div className="text-gray-500">
                  {esExpandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {esExpandido && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-gray-200 bg-gray-50 p-4"
                >
                  <div className="space-y-4">
                    {ambito.preguntas.map((pregunta, idx) => {
                      const idPregunta = idx + 1;
                      const clave = `ambito_${ambito.id}_q_${idPregunta}`;
                      const respuesta = respuestas[clave];

                      return (
                        <div key={idPregunta} className="bg-white rounded p-3">
                          <p className="text-sm font-medium text-gray-800 mb-2">
                            {ambito.letra}.{idPregunta}. {pregunta}
                          </p>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => cambiarRespuesta(ambito.id, idPregunta, 'si')}
                              className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-all ${
                                respuesta === 'si'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ✓ SÍ
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => cambiarRespuesta(ambito.id, idPregunta, 'no')}
                              className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-all ${
                                respuesta === 'no'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ✗ NO
                            </motion.button>
                          </div>
                          <CampoObservacion campo={clave} {...subsanacion} />
                        </div>
                      );
                    })}
                  </div>

                  {respondidasAmbito === 5 && (
                    <div className={`mt-4 rounded-lg border px-3 py-2 text-xs font-semibold ${color}`}>
                      Cantidad de respuestas "Sí": {cantidadSi} → Nivel {nivel}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Resumen por ámbito */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-3">RESUMEN POR ÁMBITO</p>
        <div className="grid grid-cols-2 gap-2">
          {AMBITOS.map((ambito) => {
            const cantidadSi = contarSi(ambito.id);
            const { nivel, color } = nivelAmbito(cantidadSi);
            return (
              <div key={ambito.id} className={`px-3 py-2 rounded border text-xs ${color}`}>
                <p className="font-semibold">
                  {ambito.letra}. {ambito.nombre}
                </p>
                <p>{cantidadSi} / 5 respuestas "Sí" — {nivel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}