import { useState } from 'react';
import { X } from 'lucide-react';

export default function AprobarModal({ numeroInicial = '', onClose, onConfirmar }) {
  // Precargado con la sugerencia del backend (si llegó a tiempo), pero sigue siendo
  // un input de texto normal: el Admin puede borrarlo y escribir cualquier otro número.
  const [numeroExpediente, setNumeroExpediente] = useState(numeroInicial);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const numeroValido = numeroExpediente.trim().length > 0;

  async function handleConfirmar() {
    if (!numeroValido) return;
    setError('');
    setEnviando(true);
    try {
      await onConfirmar(numeroExpediente.trim());
    } catch (err) {
      // 409 (número duplicado) u otro error del backend: se muestra en el modal, sin cerrarlo.
      setError(err.message || 'No se pudo aprobar el expediente');
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Aprobar Expediente</h2>
          <button onClick={onClose} disabled={enviando} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de expediente</label>
            <input
              type="text"
              value={numeroExpediente}
              onChange={(e) => setNumeroExpediente(e.target.value)}
              maxLength={50}
              placeholder="001-01-2026-INS"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
              disabled={enviando}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="px-5 py-2.5 rounded-xl font-semibold text-[#1B2A4A] border-2 border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={!numeroValido || enviando}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {enviando ? 'Aprobando...' : 'Aprobar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
