import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import SubsanacionArea from './SubsanacionArea';

function formatFechaHora(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Observación(es) del Admin para UN campo puntual + su bloque de
// subsanación asociado (justificación/archivo). Se usa tanto INLINE, junto
// al campo real dentro de un Step (cuando ese Step sabe ubicarlo), como en
// el banner genérico de fallback de WizardContainer para observaciones que
// no se pudieron anclar a un campo específico del formulario.
export default function CampoObservacion({
  paso,
  campo,
  observaciones = [],
  subsanaciones = [],
  expedienteId,
  estado,
  onCambio,
}) {
  const observacionesCampo = observaciones.filter((o) => o.paso === paso && o.campo === campo);
  if (observacionesCampo.length === 0) return null;

  const puedeSubsanar = estado === 'RequiereSubsanacion';

  return (
    <div className="mt-2 space-y-2">
      {observacionesCampo.map((obs) => (
        <motion.div
          key={obs.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-start gap-2.5 text-xs bg-amber-100/80 border border-amber-300 border-l-4 border-l-amber-500 rounded-lg px-3 py-2.5 shadow-sm"
        >
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold uppercase tracking-wide text-amber-900 text-[11px] mb-0.5">
              Observación de PRODHAB
            </p>
            <p className="text-amber-900">{obs.texto}</p>
            <p className="text-[11px] text-amber-600 mt-0.5">{formatFechaHora(obs.fechaCreacion)}</p>
          </div>
        </motion.div>
      ))}

      {puedeSubsanar && (
        <SubsanacionArea
          expedienteId={expedienteId}
          paso={paso}
          campo={campo}
          subsanaciones={subsanaciones}
          onCambio={onCambio}
        />
      )}
    </div>
  );
}
