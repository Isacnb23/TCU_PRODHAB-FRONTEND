import { motion } from 'framer-motion';

/**
 * StepIndicator.jsx - Indicador visual de progreso
 * 
 * Responsabilidades:
 * - Mostrar barra de progreso (0-100%)
 * - Indicar paso actual (ej: "3 de 8")
 * - Mostrar título del paso
 * - Animación suave
 */

const PASOS = [
  { id: 1, titulo: 'Información General' },
  { id: 2, titulo: 'Inventario de Bases de Datos' },
  { id: 3, titulo: 'Evaluación de Amenazas' },
  { id: 4, titulo: 'Finalidad y Datos' },
  { id: 5, titulo: 'Transferencias' },
  { id: 6, titulo: 'Gestión de Riesgos' },
  { id: 7, titulo: 'Medidas de Seguridad' },
  { id: 8, titulo: 'Revisión y Exportación' },
];

export default function StepIndicator({ currentStep }) {
  const totalSteps = PASOS.length;
  const progressPercent = (currentStep / totalSteps) * 100;
  const stepInfo = PASOS[currentStep - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 bg-white rounded-lg shadow-sm p-6"
    >
      {/* Título del paso */}
      <div className="mb-6">
        <motion.h2
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-gray-900"
        >
          {stepInfo.titulo}
        </motion.h2>
        <p className="text-sm text-gray-600 mt-2">
          Paso {currentStep} de {totalSteps}
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="space-y-3">
        {/* Porcentaje + info */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Progreso
          </span>
          <motion.span
            key={progressPercent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold text-blue-600"
          >
            {Math.round(progressPercent)}%
          </motion.span>
        </div>

        {/* Barra */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          />
        </div>

        {/* Puntos de progreso */}
        <div className="flex justify-between gap-2 mt-4">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <motion.div
                key={stepNum}
                className={`
                  flex-1 h-2 rounded-full transition-all
                  ${isActive
                    ? 'bg-blue-600'
                    : isCompleted
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                  }
                `}
                whileHover={isCompleted ? { scale: 1.1 } : {}}
                title={`Paso ${stepNum}`}
              />
            );
          })}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between text-xs text-gray-600">
        <span>
          ✅ Completados: {currentStep - 1} pasos
        </span>
        <span>
          ⏳ Falta: {totalSteps - currentStep} pasos
        </span>
      </div>
    </motion.div>
  );
}