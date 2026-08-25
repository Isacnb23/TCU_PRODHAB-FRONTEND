import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

/**
 * NavigationButtons.jsx - Barra de navegación del wizard (sticky abajo)
 *
 * Responsabilidades:
 * - Botón "Anterior" (si no es primer paso)
 * - Botón "Siguiente" (si no es último paso)
 * - En el último paso (9), las acciones reales (Descargar Excel / Enviar a
 *   PRODHAB) viven DENTRO de Step9_Revision — acá no se muestra ningún botón
 *   primario para no duplicar/confundir con un tercer camino.
 * - Mensaje de validación cuando el paso no está completo
 */

export default function NavigationButtons({
  currentStep,
  totalSteps = 9,
  onNext,
  onPrev,
  isValid = true,
  isLoading = false,
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="sticky bottom-0 max-w-4xl mx-auto mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Botón Anterior (o espaciador para mantener el primario a la derecha) */}
        {!isFirstStep ? (
          <button
            onClick={onPrev}
            disabled={isLoading}
            className="
              flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
              border-2 border-[#1B2A4A]/20 text-[#1B2A4A] bg-white
              hover:border-[#1B2A4A] hover:bg-[#1B2A4A]/5
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
        ) : (
          <span />
        )}

        {/* Mensaje de validación + botón primario (no se muestra en el último paso:
            las acciones reales de ese paso viven dentro de Step9_Revision) */}
        <div className="flex items-center gap-3">
          {!isValid && !isLastStep && !isLoading && (
            <span className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2">
              <AlertTriangle size={16} />
              Completa los campos obligatorios
            </span>
          )}

          {!isLastStep && (
            <button
              onClick={onNext}
              disabled={!isValid || isLoading}
              className="
                flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
                bg-[#1B2A4A] hover:bg-[#243761] text-white
                shadow-lg shadow-[#1B2A4A]/20
                hover:shadow-xl hover:shadow-[#1B2A4A]/30 hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:translate-y-0 disabled:hover:shadow-lg
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
            </button>
          )}
        </div>
      </div>
    </div>
  );
}