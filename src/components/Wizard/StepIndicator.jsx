import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';

/**
 * StepIndicator.jsx - Card de progreso (cabecera del paso)
 *
 * Responsabilidades:
 * - Mostrar título del paso y "Paso X de 9"
 * - Barra de progreso (0-100%) con gradiente institucional
 * - Chips con pasos completados / restantes
 */

const PASOS = [
  { id: 1, titulo: 'Información General' },
  { id: 2, titulo: 'Inventario de Bases de Datos' },
  { id: 3, titulo: 'Evaluación de Amenazas' },
  { id: 4, titulo: 'Finalidad y Datos' },
  { id: 5, titulo: 'Transferencias' },
  { id: 6, titulo: 'Gestión de Riesgos' },
  { id: 7, titulo: 'Medidas de Seguridad' },
  { id: 8, titulo: 'Seguimiento y Control' },
  { id: 9, titulo: 'Revisión Final' },
];

export default function StepIndicator({ currentStep }) {
  const totalSteps = PASOS.length;
  const progressPercent = (currentStep / totalSteps) * 100;
  const stepInfo = PASOS[currentStep - 1];
  const completados = currentStep - 1;
  const faltan = totalSteps - currentStep;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
    >
      {/* Título + subtítulo + porcentaje */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C9A84C]">
            Paso {currentStep} de {totalSteps}
          </p>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mt-0.5">
            {stepInfo.titulo}
          </h2>
        </div>
        <span className="text-lg font-bold text-[#1B2A4A]">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(to right, #1B2A4A, #C9A84C)',
          }}
        />
      </div>

      {/* Chips de estado */}
      <div className="flex items-center gap-3 mt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-3 py-1">
          <CheckCircle2 size={12} />
          Completados {completados}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-xs font-medium px-3 py-1">
          <Clock size={12} />
          Falta {faltan}
        </span>
      </div>
    </motion.div>
  );
}
