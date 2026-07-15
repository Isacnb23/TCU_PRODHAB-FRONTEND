import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import InfoBanner from '../Common/InfoBanner';

/**
 * Step3_Amenazas.jsx - Paso 3: Evaluación de Amenazas
 * 
 * 4 Ámbitos × 5 preguntas cada uno = 20 preguntas totales
 * Cálculo automático de puntuación por ámbito
 * 
 * Ámbitos:
 * 1. Acceso no autorizado a datos
 * 2. Destrucción de datos
 * 3. Alteración de datos
 * 4. No disponibilidad de datos
 * 
 * Artículos del Reglamento: Art. 34, 35
 */

const AMBITOS = [
  {
    id: 1,
    nombre: 'Acceso No Autorizado',
    icono: '🔓',
    descripcion:
      'Riesgo de que terceros no autorizados accedan a los datos personales',
    preguntas: [
      'Existen controles de acceso basados en roles',
      'Se registran y monitorean los accesos a la BD',
      'Se utilizan conexiones cifradas (SSL/TLS)',
      'Se implementa autenticación multifactor',
      'Hay auditoría regular de permisos de acceso',
    ],
  },
  {
    id: 2,
    nombre: 'Destrucción de Datos',
    icono: '🗑️',
    descripcion: 'Riesgo de pérdida permanente de datos personales',
    preguntas: [
      'Existen copias de seguridad (backups) regulares',
      'Los backups se prueban periódicamente',
      'Se almacenan en ubicación física diferente',
      'Hay plan de recuperación ante desastres',
      'Se documentan procedimientos de backup y restauración',
    ],
  },
  {
    id: 3,
    nombre: 'Alteración de Datos',
    icono: '✏️',
    descripcion: 'Riesgo de modificación no autorizada de datos',
    preguntas: [
      'Se registran cambios en BD (auditoría)',
      'Hay validaciones de integridad de datos',
      'Los cambios requieren autorización',
      'Se mantiene historial de modificaciones',
      'Se detectan cambios anómalos o masivos',
    ],
  },
  {
    id: 4,
    nombre: 'No Disponibilidad',
    icono: '⏸️',
    descripcion: 'Riesgo de que los datos no estén disponibles cuando se necesitan',
    preguntas: [
      'Hay redundancia en servidores/infraestructura',
      'Existe plan de continuidad del negocio',
      'Se monitorean tiempos de respuesta',
      'Hay mantenimiento preventivo programado',
      'Se definen SLA (acuerdos de nivel de servicio)',
    ],
  },
];

export default function Step3_Amenazas({ data = {}, onChange }) {
  const [respuestas, setRespuestas] = useState(
    data.respuestas || {}
  );
  const [expandidos, setExpandidos] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
  });

  useEffect(() => {
    // Válido cuando las 20 preguntas (4 ámbitos × 5) están respondidas
    const totalPreguntas = AMBITOS.length * 5;
    const isValid = Object.keys(respuestas).length === totalPreguntas;
    onChange({ respuestas }, isValid);
  }, [respuestas]);

  /**
   * Alternar expansión de ámbito
   */
  const toggleAmbito = (idAmbito) => {
    setExpandidos((prev) => ({
      ...prev,
      [idAmbito]: !prev[idAmbito],
    }));
  };

  /**
   * Cambiar respuesta (SI/NO)
   */
  const cambiarRespuesta = (idAmbito, idPregunta, valor) => {
    const clave = `ambito_${idAmbito}_q_${idPregunta}`;
    setRespuestas((prev) => ({
      ...prev,
      [clave]: valor,
    }));
  };

  /**
   * Calcular puntuación de un ámbito
   */
  const calcularPuntuacion = (idAmbito) => {
    let siCount = 0;
    for (let i = 1; i <= 5; i++) {
      const clave = `ambito_${idAmbito}_q_${i}`;
      if (respuestas[clave] === 'si') siCount++;
    }
    return siCount; // 0-5
  };

  /**
   * Obtener color según puntuación
   */
  const obtenerColor = (puntuacion) => {
    if (puntuacion >= 4) return 'bg-green-100 border-green-300 text-green-800';
    if (puntuacion === 3) return 'bg-primary-100 border-primary-300 text-primary-800';
    if (puntuacion === 2) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  /**
   * Calcular puntuación total
   */
  const puntuacionTotal = AMBITOS.reduce(
    (acc, ambito) => acc + calcularPuntuacion(ambito.id),
    0
  );
  const puntuacionPromedio = (puntuacionTotal / (AMBITOS.length * 5)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Descripción */}
      <InfoBanner
        Icon={ShieldAlert}
        title="Paso 3: Evaluación de Amenazas"
        description="Responde SÍ o NO a cada pregunta sobre las medidas de seguridad en 4 ámbitos."
      />

      {/* Barra de progreso general */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Progreso General
          </span>
          <span className="text-sm font-bold text-primary-600">
            {puntuacionTotal} / 20 ({Math.round(puntuacionPromedio)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            animate={{ width: `${puntuacionPromedio}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          />
        </div>
      </div>

      {/* Ámbitos */}
      <div className="space-y-4">
        {AMBITOS.map((ambito) => {
          const puntuacion = calcularPuntuacion(ambito.id);
          const esExpandido = expandidos[ambito.id];

          return (
            <motion.div
              key={ambito.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header del ámbito */}
              <button
                onClick={() => toggleAmbito(ambito.id)}
                className="w-full bg-white px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-2xl">{ambito.icono}</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {ambito.id}. {ambito.nombre}
                    </p>
                    <p className="text-xs text-gray-600">
                      {ambito.descripcion}
                    </p>
                  </div>
                </div>

                {/* Puntuación */}
                <div
                  className={`px-3 py-1 rounded-full border font-bold text-sm mr-4 ${obtenerColor(
                    puntuacion
                  )}`}
                >
                  {puntuacion}/5
                </div>

                {/* Icono expandir/contraer */}
                <div className="text-gray-500">
                  {esExpandido ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Preguntas (expandible) */}
              {esExpandido && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
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
                            P{idPregunta}. {pregunta}
                          </p>

                          {/* Botones SI/NO */}
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                cambiarRespuesta(
                                  ambito.id,
                                  idPregunta,
                                  'si'
                                )
                              }
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
                              onClick={() =>
                                cambiarRespuesta(
                                  ambito.id,
                                  idPregunta,
                                  'no'
                                )
                              }
                              className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-all ${
                                respuesta === 'no'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ✗ NO
                            </motion.button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-3">
          📊 RESUMEN POR ÁMBITO
        </p>
        <div className="grid grid-cols-2 gap-2">
          {AMBITOS.map((ambito) => {
            const puntuacion = calcularPuntuacion(ambito.id);
            return (
              <div
                key={ambito.id}
                className={`px-3 py-2 rounded border text-xs ${obtenerColor(
                  puntuacion
                )}`}
              >
                <p className="font-semibold">{ambito.nombre}</p>
                <p>{puntuacion} / 5</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}