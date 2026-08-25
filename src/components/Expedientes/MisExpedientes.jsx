import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilePlus2, Inbox, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as expedienteService from '../../services/expedienteService';
import NuevoExpedienteModal from './NuevoExpedienteModal';

const ESTADO_BADGE = {
  Borrador: 'bg-gray-100 text-gray-700 border-gray-300',
  Enviado: 'bg-blue-50 text-blue-700 border-blue-200',
  EnRevision: 'bg-amber-50 text-amber-700 border-amber-200',
  RequiereSubsanacion: 'bg-red-50 text-red-700 border-red-200',
  Aprobado: 'bg-green-50 text-green-700 border-green-200',
};

function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MisExpedientes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '');

  async function cargar() {
    setLoading(true);
    setError('');
    try {
      const data = await expedienteService.listar();
      setExpedientes(data || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la lista de expedientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // Limpiar el mensaje del state para que no reaparezca en un refresh manual.
    if (location.state?.mensaje) {
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El mensaje de éxito del envío es notorio pero no debe quedarse pegado para siempre.
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(''), 6000);
    return () => clearTimeout(timer);
  }, [mensaje]);

  // Los que requieren subsanación necesitan acción del usuario: van primero.
  // Array.prototype.sort es estable, así que el orden dentro de cada grupo se mantiene.
  const expedientesOrdenados = useMemo(
    () =>
      [...expedientes].sort(
        (a, b) => (b.estado === 'RequiereSubsanacion') - (a.estado === 'RequiereSubsanacion')
      ),
    [expedientes]
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Mis Expedientes</h1>
          <p className="text-sm text-gray-500">Protocolos de actuación · Ley 8968</p>
        </div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] shadow-lg shadow-[#1B2A4A]/20 transition-all"
        >
          <FilePlus2 className="w-5 h-5" />
          Nuevo Expediente
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-sm text-gray-500 py-16">Cargando expedientes...</div>
      ) : error ? null : expedientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-2xl py-16 px-6">
          <Inbox className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">Aún no tienes expedientes.</p>
          <p className="text-sm text-gray-400 mb-4">Crea el primero para empezar tu protocolo de actuación.</p>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] transition-all"
          >
            Crear mi primer expediente
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#1B2A4A]/5 text-[#1B2A4A] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Entidad</th>
                <th className="text-left px-5 py-3">Año</th>
                <th className="text-left px-5 py-3">Nº Expediente</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Paso</th>
                <th className="text-left px-5 py-3">Última modificación</th>
              </tr>
            </thead>
            <tbody>
              {expedientesOrdenados.map((exp) => {
                const requiereSubsanacion = exp.estado === 'RequiereSubsanacion';
                return (
                <tr
                  key={exp.id}
                  onClick={() => navigate(`/expedientes/${exp.id}`)}
                  className={`border-t border-gray-100 hover:bg-[#1B2A4A]/5 cursor-pointer transition-colors ${
                    requiereSubsanacion ? 'bg-amber-50/70 border-l-4 border-l-amber-400' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {requiereSubsanacion && (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <div>
                        {exp.entidad}
                        {requiereSubsanacion && (
                          <p className="text-xs font-normal text-amber-600">Requiere tu atención</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{exp.anio}</td>
                  <td className="px-5 py-3 text-gray-600">{exp.numeroExpediente || 'Sin asignar'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        ESTADO_BADGE[exp.estado] || 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {exp.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">Paso {exp.pasoActual} de 9</td>
                  <td className="px-5 py-3 text-gray-500">{formatFecha(exp.fechaModificacion)}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <NuevoExpedienteModal
          onClose={() => setModalAbierto(false)}
          onCreado={(id) => navigate(`/expedientes/${id}`)}
        />
      )}
    </div>
  );
}
