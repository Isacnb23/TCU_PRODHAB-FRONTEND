import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle } from 'lucide-react';

/**
 * Sidebar.jsx - Panel lateral con lista de pasos
 * 
 * Responsabilidades:
 * - Mostrar los 8 pasos del wizard
 * - Indicar paso actual
 * - Indicar pasos completados
 * - Permitir navegar a pasos anteriores
 */

const PASOS = [
  { id: 1, nombre: 'General', icono: '📋' },
  { id: 2, nombre: 'Inventario', icono: '📊' },
  { id: 3, nombre: 'Amenazas', icono: '⚠️' },
  { id: 4, nombre: 'Finalidad', icono: '🎯' },
  { id: 5, nombre: 'Transferencia', icono: '🔄' },
  { id: 6, nombre: 'Riesgos', icono: '📈' },
  { id: 7, nombre: 'Seguridad', icono: '🔒' },
  { id: 8, nombre: 'Revisión', icono: '✅' },
];

export default function Sidebar({ currentStep, setCurrentStep }) {
  const navigate = useNavigate();

  const handleStepClick = (stepId) => {
    // Solo permitir ir a pasos anteriores
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      navigate('/');
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 p-6 min-h-screen">
      {/* Título */}
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Pasos
      </h2>

      {/* Lista de pasos */}
      <nav className="space-y-3">
        {PASOS.map((paso) => {
          const isActive = paso.id === currentStep;
          const isCompleted = paso.id < currentStep;
          const canClick = paso.id < currentStep;

          return (
            <button
              key={paso.id}
              onClick={() => handleStepClick(paso.id)}
              disabled={!canClick}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-700 font-semibold'
                  : isCompleted
                  ? 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {/* Icono de estado */}
              <div className="text-xl">{paso.icono}</div>

              {/* Info paso */}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  Paso {paso.id}
                </p>
                <p className="text-xs opacity-75">
                  {paso.nombre}
                </p>
              </div>

              {/* Indicador estado */}
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : isActive ? (
                <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Info adicional */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">
            💡 TIP
          </p>
          <p className="text-xs text-blue-600">
            Puedes volver a pasos anteriores para revisar o corregir información.
          </p>
        </div>
      </div>
    </aside>
  );
}