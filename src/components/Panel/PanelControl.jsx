import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderOpen, AlertCircle } from 'lucide-react';
import * as expedienteService from '../../services/expedienteService';
import * as usuarioService from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';
import { etiquetaEstado, claseEstado } from '../../utils/estadoLabel';
import SelectEstilizado from '../Common/SelectEstilizado';

const ROL_BADGE = {
  Admin: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/30',
  Usuario: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ESTADO_BADGE_USUARIO = {
  activo: 'bg-green-50 text-green-700 border-green-200',
  inactivo: 'bg-gray-100 text-gray-600 border-gray-300',
};

const OPCIONES_ROL = [
  { value: '', label: 'Todos' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Usuario', label: 'Usuario' },
];

const OPCIONES_ESTADO_EXPEDIENTE = [
  { value: '', label: 'Todos' },
  { value: 'Enviado', label: 'Pendientes de revisión' },
  { value: 'RequiereSubsanacion', label: 'Requiere Subsanación' },
  { value: 'Aprobado', label: 'Aprobados' },
];

function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PanelControl() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const [expedientes, setExpedientes] = useState([]);
  const [loadingExpedientes, setLoadingExpedientes] = useState(true);
  const [errorExpedientes, setErrorExpedientes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    let cancelado = false;
    setLoadingUsuarios(true);
    setErrorUsuarios('');
    usuarioService
      .listar()
      .then((data) => {
        if (!cancelado) setUsuarios(data || []);
      })
      .catch((err) => {
        if (!cancelado) setErrorUsuarios(err.message || 'No se pudo cargar la lista de usuarios');
      })
      .finally(() => {
        if (!cancelado) setLoadingUsuarios(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    setLoadingExpedientes(true);
    setErrorExpedientes('');
    expedienteService
      .listar(filtroEstado || undefined)
      .then((data) => {
        if (!cancelado) setExpedientes(data || []);
      })
      .catch((err) => {
        if (!cancelado) setErrorExpedientes(err.message || 'No se pudo cargar los expedientes');
      })
      .finally(() => {
        if (!cancelado) setLoadingExpedientes(false);
      });
    return () => {
      cancelado = true;
    };
  }, [filtroEstado]);

  const usuariosFiltrados = filtroRol ? usuarios.filter((u) => u.rol === filtroRol) : usuarios;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Panel de Control</h1>
        <p className="text-sm text-gray-500">Resumen general del sistema · Ley 8968</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Usuarios */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1B2A4A]" />
              <h2 className="font-semibold text-[#1B2A4A]">Usuarios</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
              className="text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/40 rounded-lg px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-all duration-200"
            >
              Gestionar
            </button>
          </div>

          <div className="px-5 pt-4">
            <div className="w-40">
              <SelectEstilizado value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                {OPCIONES_ROL.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </SelectEstilizado>
            </div>
          </div>

          <div className="p-5 pt-3">
            {errorUsuarios && (
              <div className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorUsuarios}
              </div>
            )}

            {loadingUsuarios ? (
              <div className="text-center text-sm text-gray-500 py-10">Cargando usuarios...</div>
            ) : errorUsuarios ? null : usuariosFiltrados.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-10">No hay usuarios para este filtro.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[#1B2A4A] text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left py-2">Nombre</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Rol</th>
                      <th className="text-left py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="border-t border-gray-100">
                        <td className="py-2.5 font-medium text-gray-800">{usuario.nombre}</td>
                        <td className="py-2.5 text-gray-600">{usuario.email}</td>
                        <td className="py-2.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              ROL_BADGE[usuario.rol] || 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              usuario.activo ? ESTADO_BADGE_USUARIO.activo : ESTADO_BADGE_USUARIO.inactivo
                            }`}
                          >
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Expedientes */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#1B2A4A]" />
              <h2 className="font-semibold text-[#1B2A4A]">Expedientes</h2>
            </div>
          </div>

          <div className="px-5 pt-4">
            <div className="w-56">
              <SelectEstilizado value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                {OPCIONES_ESTADO_EXPEDIENTE.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </SelectEstilizado>
            </div>
          </div>

          <div className="p-5 pt-3">
            {errorExpedientes && (
              <div className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorExpedientes}
              </div>
            )}

            {loadingExpedientes ? (
              <div className="text-center text-sm text-gray-500 py-10">Cargando expedientes...</div>
            ) : errorExpedientes ? null : expedientes.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-10">No hay expedientes para este filtro.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[#1B2A4A] text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left py-2">Entidad</th>
                      <th className="text-left py-2">Año</th>
                      <th className="text-left py-2">Estado</th>
                      <th className="text-left py-2">Últ. modificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expedientes.map((exp) => (
                      <tr
                        key={exp.id}
                        onClick={() => navigate(`/revision/${exp.id}`)}
                        className="border-t border-gray-100 hover:bg-[#1B2A4A]/5 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 font-medium text-gray-800">{exp.entidad}</td>
                        <td className="py-2.5 text-gray-600">{exp.anio}</td>
                        <td className="py-2.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${claseEstado(
                              exp.estado,
                              exp.tieneObservacionesPrevias
                            )}`}
                          >
                            {etiquetaEstado(exp.estado, user?.rol, exp.tieneObservacionesPrevias)}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-500">{formatFecha(exp.fechaModificacion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
