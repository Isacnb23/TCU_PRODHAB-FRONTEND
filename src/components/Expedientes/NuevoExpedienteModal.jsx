import { useState } from 'react';
import { X } from 'lucide-react';
import * as expedienteService from '../../services/expedienteService';

export default function NuevoExpedienteModal({ onClose, onCreado }) {
  const [entidad, setEntidad] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  const entidadValida = entidad.trim().length > 0 && entidad.length <= 300;

  async function handleCrear() {
    if (!entidadValida) return;
    setError('');
    setCreando(true);
    try {
      const expediente = await expedienteService.crear({ entidad: entidad.trim(), anio: Number(anio) });
      onCreado(expediente.id);
    } catch (err) {
      setError(err.message || 'No se pudo crear el expediente');
      setCreando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Nuevo Expediente</h2>
          <button onClick={onClose} disabled={creando} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la entidad</label>
            <input
              type="text"
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              maxLength={300}
              placeholder="Ej: Ministerio de Prueba"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
              disabled={creando}
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
              disabled={creando}
              className="px-5 py-2.5 rounded-xl font-semibold text-[#1B2A4A] border-2 border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCrear}
              disabled={!entidadValida || creando}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {creando ? 'Creando...' : 'Crear y continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
