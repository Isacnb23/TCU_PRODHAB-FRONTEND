import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Inbox, AlertCircle, CheckCircle2, ClipboardCheck } from 'lucide-react';
import * as expedienteService from '../../services/expedienteService';

const ESTADO_BADGE = {
  Borrador: 'bg-gray-100 text-gray-700 border-gray-300',
  Enviado: 'bg-blue-50 text-blue-700 border-blue-200',
  EnRevision: 'bg-amber-50 text-amber-700 border-amber-200',
  RequiereSubsanacion: 'bg-red-50 text-red-700 border-red-200',
  Aprobado: 'bg-green-50 text-green-700 border-green-200',
};

const OPCIONES_ESTADO = [
  { value: 'Enviado', label: 'Pendientes de revisión (Enviado)' },
  { value: 'RequiereSubsanacion', label: 'Requiere Subsanación' },
  { value: 'Aprobado', label: 'Aprobados' },
];

function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function RevisionBandeja() {
  const navigate = useNavigate();
  const location = useLocation();
  const [estado, setEstado] = useState('Enviado');
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '');

  async function cargar() {
    setLoading(true);
    setError('');
    try {
      const data = await expedienteService.listar(estado);
      setExpedientes(data || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la bandeja de revisión');
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
  }, [estado]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Bandeja de Revisión</h1>
          <p className="text-sm text-gray-500">Expedientes enviados por las entidades · Ley 8968</p>
        </div>

        <select
          value={estado}
          onChange={(e) => {
            setMensaje('');
            setEstado(e.target.value);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
        >
          {OPCIONES_ESTADO.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {mensaje && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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
          <p className="text-gray-600 font-medium">No hay expedientes pendientes de revisión.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#1B2A4A]/5 text-[#1B2A4A] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Entidad</th>
                <th className="text-left px-5 py-3">Año</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Fecha de envío</th>
                <th className="text-right px-5 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {expedientes.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => navigate(`/revision/${exp.id}`)}
                  className="border-t border-gray-100 hover:bg-[#1B2A4A]/5 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-800">{exp.entidad}</td>
                  <td className="px-5 py-3 text-gray-600">{exp.anio}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        ESTADO_BADGE[exp.estado] || 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {exp.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{formatFecha(exp.fechaModificacion)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[#1B2A4A] font-semibold text-xs">
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Revisar
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
