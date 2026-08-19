import { useState } from 'react';
import { Download, FileText, Paperclip, Trash2, AlertCircle } from 'lucide-react';
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

// Sección "Subsanación de este paso": lista lo ya adjuntado y permite adjuntar
// una nueva justificación/archivo para el paso observado actual.
export default function SubsanacionArea({ expedienteId, paso, campo, subsanaciones, onCambio }) {
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [eliminandoId, setEliminandoId] = useState(null);

  const delPaso = subsanaciones.filter((s) => s.paso === paso);
  const puedeAdjuntar = texto.trim().length > 0 || !!archivo;

  async function handleAdjuntar() {
    if (!puedeAdjuntar || enviando) return;
    setError('');
    setEnviando(true);
    try {
      await subsanacionService.crear(expedienteId, {
        paso,
        campo,
        textoJustificacion: texto.trim() || undefined,
        archivo: archivo || undefined,
      });
      setTexto('');
      setArchivo(null);
      await onCambio();
    } catch (err) {
      setError(err.message || 'No se pudo adjuntar la subsanación');
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar(subsanacionId) {
    setEliminandoId(subsanacionId);
    setError('');
    try {
      await subsanacionService.eliminar(expedienteId, subsanacionId);
      await onCambio();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la subsanación');
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-3">
        Subsanación de este paso
      </h3>

      {delPaso.length > 0 && (
        <div className="space-y-2 mb-4">
          {delPaso.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5"
            >
              <div className="text-sm min-w-0">
                {s.textoJustificacion && <p className="text-gray-700">{s.textoJustificacion}</p>}
                {s.tieneArchivo && (
                  <p className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                    <Paperclip size={12} />
                    {s.archivoNombre}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatFechaHora(s.fechaSubsanacion)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {s.tieneArchivo && (
                  <button
                    type="button"
                    onClick={() => subsanacionService.descargarArchivo(expedienteId, s.id, s.archivoNombre)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#1B2A4A] hover:underline"
                  >
                    <Download size={12} />
                    Descargar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEliminar(s.id)}
                  disabled={eliminandoId === s.id}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  {eliminandoId === s.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Justificación (opcional)
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={2}
            placeholder="Explica qué corregiste o adjunta el archivo actualizado..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Archivo (opcional, PDF o Word)
          </label>
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 cursor-pointer hover:border-[#1B2A4A] hover:bg-[#1B2A4A]/5 transition-colors">
            <FileText size={16} className="flex-shrink-0" />
            {archivo ? archivo.name : 'Selecciona un archivo (.pdf, .docx)'}
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleAdjuntar}
          disabled={!puedeAdjuntar || enviando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Paperclip size={16} />
          {enviando ? 'Adjuntando...' : 'Adjuntar subsanación'}
        </button>
      </div>
    </div>
  );
}
