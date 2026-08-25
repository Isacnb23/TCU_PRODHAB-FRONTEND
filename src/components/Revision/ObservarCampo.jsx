import { useState } from 'react';
import { Flag, MessageSquareWarning, CheckCircle2, Download, Paperclip } from 'lucide-react';
import * as subsanacionService from '../../services/subsanacionService';

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

function extensionDeArchivo(nombre) {
  if (!nombre) return 'ARCH';
  const partes = nombre.split('.');
  return partes.length > 1 ? partes.pop().toUpperCase().slice(0, 4) : 'ARCH';
}

// Control de observación a nivel de CAMPO puntual (no de paso entero): se
// coloca junto a cada campo renderizado por CampoPaso (o cada celda de una
// tabla, o cada pregunta de Amenazas). `campo` es el identificador estable
// que se envía al backend (misma clave que en datosJson, o un derivado
// estable para estructuras anidadas, ver revisionDisplay/CampoPaso).
export default function ObservarCampo({
  paso,
  campo,
  anteriores,
  valorNuevo,
  subsanaciones = [],
  expedienteId,
  onGuardar,
  onQuitar,
  puedeObservar,
  compact,
}) {
  const [abierto, setAbierto] = useState(false);
  const [textoLocal, setTextoLocal] = useState('');

  const tieneNueva = (valorNuevo || '').trim().length > 0;

  // Cruce con las subsanaciones del usuario: si ESTE campo (mismo paso + campo) ya tiene
  // al menos una respuesta adjuntada, la observación de ronda pasada se muestra "Subsanada"
  // (verde) con esa respuesta en contexto, en vez del indicador ámbar de pendiente.
  const subsanacionesCampo = subsanaciones.filter((s) => s.paso === paso && s.campo === campo);
  const estaSubsanado = subsanacionesCampo.length > 0;

  function handleDescargar(sub) {
    subsanacionService.descargarArchivo(expedienteId, sub.id, sub.archivoNombre);
  }

  function abrir() {
    setTextoLocal(valorNuevo || '');
    setAbierto(true);
  }

  function guardar() {
    const texto = textoLocal.trim();
    if (texto.length === 0) {
      onQuitar(campo);
    } else {
      onGuardar(campo, texto);
    }
    setAbierto(false);
  }

  function cancelar() {
    setAbierto(false);
  }

  function quitar() {
    onQuitar(campo);
    setAbierto(false);
  }

  const textSize = compact ? 'text-[11px]' : 'text-xs';

  return (
    <div className={compact ? 'mt-1' : 'mt-1.5'}>
      {anteriores.length > 0 && (
        <div className="space-y-1 mb-1">
          {anteriores.map((obs) => (
            <div
              key={obs.id}
              className={`flex items-start gap-1.5 ${textSize} rounded px-2 py-1 ${
                estaSubsanado
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              {estaSubsanado ? (
                <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-600" />
              ) : (
                <MessageSquareWarning className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-500" />
              )}
              <span>
                <span className="font-semibold">
                  {estaSubsanado ? 'Observación (subsanada):' : 'Observación anterior (pendiente de respuesta):'}
                </span>{' '}
                {obs.texto}
                {obs.fechaCreacion && <span className="opacity-70"> · {formatFechaHora(obs.fechaCreacion)}</span>}
              </span>
            </div>
          ))}

          {estaSubsanado &&
            subsanacionesCampo.map((sub) => (
              <div
                key={sub.id}
                className={`flex items-start gap-1.5 ${textSize} bg-white border border-green-200 rounded px-2 py-1.5`}
              >
                <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-600" />
                <div className="min-w-0">
                  <p className="font-semibold text-green-700">Subsanado</p>
                  {sub.textoJustificacion && <p className="text-gray-700 mt-0.5">{sub.textoJustificacion}</p>}
                  {sub.tieneArchivo && (
                    <button
                      type="button"
                      onClick={() => handleDescargar(sub)}
                      className="flex items-center gap-1.5 mt-1 text-[#1B2A4A] hover:underline"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded bg-[#1B2A4A]/10 text-[9px] font-bold flex-shrink-0">
                        {extensionDeArchivo(sub.archivoNombre)}
                      </span>
                      <span className="truncate">{sub.archivoNombre || 'archivo'}</span>
                      <Download className="w-3 h-3 flex-shrink-0" />
                    </button>
                  )}
                  {!sub.textoJustificacion && !sub.tieneArchivo && (
                    <p className="text-gray-400 italic mt-0.5 flex items-center gap-1">
                      <Paperclip className="w-2.5 h-2.5" /> Sin justificación ni archivo adjunto.
                    </p>
                  )}
                  {sub.fechaSubsanacion && (
                    <p className="opacity-60 mt-0.5">{formatFechaHora(sub.fechaSubsanacion)}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {puedeObservar && (
        <>
          {!abierto && !tieneNueva && (
            <button
              type="button"
              onClick={abrir}
              className={`inline-flex items-center gap-1 ${textSize} text-gray-400 hover:text-amber-600 transition-colors`}
              title="Observar este campo"
            >
              <Flag className="w-3 h-3" />
              Observar
            </button>
          )}

          {!abierto && tieneNueva && (
            <button
              type="button"
              onClick={abrir}
              className={`inline-flex items-center gap-1.5 ${textSize} font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded px-2 py-1 hover:bg-amber-100 transition-colors max-w-full`}
              title="Editar observación"
            >
              <Flag className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{valorNuevo}</span>
            </button>
          )}

          {abierto && (
            <div className="space-y-1.5">
              <textarea
                autoFocus
                value={textoLocal}
                onChange={(e) => setTextoLocal(e.target.value)}
                rows={compact ? 2 : 2}
                maxLength={2000}
                placeholder="Escribe la observación para este campo..."
                className={`w-full border border-amber-300 rounded-lg px-2.5 py-1.5 ${textSize} focus:outline-none focus:ring-2 focus:ring-amber-400`}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={guardar}
                  className={`${textSize} font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded px-2.5 py-1 transition-colors`}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelar}
                  className={`${textSize} font-medium text-gray-500 hover:text-gray-700 rounded px-2 py-1 transition-colors`}
                >
                  Cancelar
                </button>
                {tieneNueva && (
                  <button
                    type="button"
                    onClick={quitar}
                    className={`${textSize} font-medium text-red-500 hover:text-red-600 rounded px-2 py-1 transition-colors ml-auto`}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
