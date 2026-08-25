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
        <div
          key={obs.id}
          className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2"
        >
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p>
              <span className="font-semibold">Observación del Admin:</span> {obs.texto}
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">{formatFechaHora(obs.fechaCreacion)}</p>
          </div>
        </div>
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
