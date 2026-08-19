import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Database,
  ShieldAlert,
  Target,
  ArrowLeftRight,
  BarChart3,
  Lock,
  ClipboardList,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';

/**
 * Sidebar.jsx - Panel lateral con la lista de pasos del wizard
 *
 * Responsabilidades:
 * - Mostrar los 9 pasos con su ícono
 * - Indicar paso activo, completados y pendientes
 * - Permitir navegar a pasos anteriores
 */

const PASOS = [
  { id: 1, nombre: 'General', icono: Building2 },
  { id: 2, nombre: 'Inventario', icono: Database },
  { id: 3, nombre: 'Amenazas', icono: ShieldAlert },
  { id: 4, nombre: 'Finalidad', icono: Target },
  { id: 5, nombre: 'Transferencia', icono: ArrowLeftRight },
  { id: 6, nombre: 'Riesgos', icono: BarChart3 },
  { id: 7, nombre: 'Seguridad', icono: Lock },
  { id: 8, nombre: 'Seguimiento', icono: ClipboardList },
  { id: 9, nombre: 'Revisión', icono: CheckCircle2 },
];

export default function Sidebar({ currentStep, setCurrentStep }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleStepClick = (stepId) => {
    // Solo permitir ir a pasos anteriores
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      // El wizard ahora vive en /expedientes/:id; mantenerse ahí en vez de
      // navegar a "/" (que ya no existe como ruta del wizard).
      if (id) navigate(`/expedientes/${id}`);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#1B2A4A] overflow-y-auto flex flex-col">
      <div className="p-4 flex-1">
        {/* Título */}
        <h2 className="px-2 pt-3 mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#C9A84C]">
          Pasos
        </h2>

        {/* Lista de pasos */}
        <nav className="space-y-1">
          {PASOS.map((paso) => {
            const Icono = paso.icono;
            const isActive = paso.id === currentStep;
            const isCompleted = paso.id < currentStep;
            const canClick = paso.id < currentStep;

            return (
              <button
                key={paso.id}
                onClick={() => handleStepClick(paso.id)}
                disabled={!canClick}
                className={`
                  w-full flex items-center gap-3 pl-3 pr-3 py-2 rounded-lg border-l-[3px]
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white/10 border-[#C9A84C] cursor-default'
                      : isCompleted
                      ? 'border-transparent hover:bg-white/5 cursor-pointer'
                      : 'border-transparent cursor-not-allowed'
                  }
                `}
              >
                {/* Ícono en contenedor cuadrado 36x36 */}
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0
                    ${
                      isActive
                        ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                        : isCompleted
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-white/5 text-white/30'
                    }`}
                >
                  <Icono size={18} />
                </span>

                {/* Nombre del paso */}
                <span
                  className={`flex-1 text-left text-sm
                    ${
                      isActive
                        ? 'text-white font-semibold'
                        : isCompleted
                        ? 'text-white/70'
                        : 'text-white/40'
                    }`}
                >
                  {paso.nombre}
                </span>

                {/* Indicador a la derecha: número / check / dot activo */}
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                ) : isActive ? (
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[#C9A84C] font-semibold">
                      {paso.id}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                  </span>
                ) : (
                  <span className="text-xs text-white/20 flex-shrink-0">
                    {paso.id}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tip card */}
      <div className="p-4">
        <div className="rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/30 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb size={14} className="text-[#C9A84C]" />
            <span className="text-xs font-semibold text-[#C9A84C]">Tip</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Puedes volver a pasos anteriores para revisar o corregir la información.
          </p>
        </div>
      </div>
    </aside>
  );
}
