import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

/**
 * NavigationButtons.jsx - Botones de navegación del wizard
 * 
 * Responsabilidades:
 * - Botón "Atrás" (si no es primer paso)
 * - Botón "Siguiente" (si no es último paso)
 * - Botón "Descargar Excel" (si es último paso)
 * - Validación antes de permitir avanzar
 */

export default function NavigationButtons({
  currentStep,
  totalSteps = 8,
  onNext,
  onPrev,
  isValid = true,
  isLoading = false,
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-200"
    >
      {/* Botón Atrás */}
      {!isFirstStep && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrev}
          disabled={isLoading}
          className="
            flex items-center gap-2 px-6 py-3 rounded-lg
            bg-gray-200 text-gray-800 font-medium
            hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          <ChevronLeft className="w-5 h-5" />
          Atrás
        </motion.button>
      )}

      {/* Espaciador */}
      <div className="flex-1" />

      {/* Botón Siguiente o Descargar */}
      {!isLastStep ? (
        <motion.button
          whileHover={isValid ? { scale: 1.05 } : {}}
          whileTap={isValid ? { scale: 0.95 } : {}}
          onClick={onNext}
          disabled={!isValid || isLoading}
          className="
            flex items-center gap-2 px-6 py-3 rounded-lg
            bg-blue-600 text-white font-medium
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Procesando...
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          disabled={isLoading}
          className="
            flex items-center gap-2 px-6 py-3 rounded-lg
            bg-green-600 text-white font-medium
            hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Generando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar Excel
            </>
          )}
        </motion.button>
      )}

      {/* Información */}
      {!isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 font-medium ml-4"
        >
          ⚠️ Completa los campos obligatorios
        </motion.div>
      )}
    </motion.div>
  );
}