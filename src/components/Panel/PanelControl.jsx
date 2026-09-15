import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderOpen, AlertCircle, CheckCircle2, UserPlus, FilePlus2, KeyRound, Copy, Check, X, UserX, ShieldCheck } from 'lucide-react';
import * as expedienteService from '../../services/expedienteService';
import * as usuarioService from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';
import { etiquetaEstado, claseEstado } from '../../utils/estadoLabel';
import SelectEstilizado from '../Common/SelectEstilizado';
import NuevoUsuarioModal from '../Usuarios/NuevoUsuarioModal';
import NuevoExpedienteModal from '../Expedientes/NuevoExpedienteModal';

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
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [mensajeUsuarios, setMensajeUsuarios] = useState('');
  const [desactivandoId, setDesactivandoId] = useState(null);
  const [reseteandoId, setReseteandoId] = useState(null);
  const [passwordTemporal, setPasswordTemporal] = useState(null); // { usuario, password }
  const [copiado, setCopiado] = useState(false);

  const [expedientes, setExpedientes] = useState([]);
  const [loadingExpedientes, setLoadingExpedientes] = useState(true);
  const [errorExpedientes, setErrorExpedientes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalExpedienteAbierto, setModalExpedienteAbierto] = useState(false);

  function cargarUsuarios() {
    setLoadingUsuarios(true);
    setErrorUsuarios('');
    usuarioService
      .listar()
      .then((data) => setUsuarios(data || []))
      .catch((err) => setErrorUsuarios(err.message || 'No se pudo cargar la lista de usuarios'))
      .finally(() => setLoadingUsuarios(false));
  }

  useEffect(() => {
    cargarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function handleUsuarioCreado(usuario) {
    setModalUsuarioAbierto(false);
    setMensajeUsuarios(`Usuario "${usuario.nombre}" creado correctamente.`);
    cargarUsuarios();
  }

  async function handleDesactivar(usuario) {
    const confirmado = window.confirm(`¿Desactivar a ${usuario.nombre}? No podrá iniciar sesión.`);
    if (!confirmado) return;

    setErrorUsuarios('');
    setMensajeUsuarios('');
    setDesactivandoId(usuario.id);
    try {
      await usuarioService.desactivar(usuario.id);
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, activo: false } : u)));
    } catch (err) {
      setErrorUsuarios(err.message || 'No se pudo desactivar el usuario');
    } finally {
      setDesactivandoId(null);
    }
  }

  async function handleResetearPassword(usuario) {
    const confirmado = window.confirm(
      `¿Generar una contraseña temporal para ${usuario.nombre}? Su contraseña actual dejará de funcionar.`
    );
    if (!confirmado) return;

    setErrorUsuarios('');
    setMensajeUsuarios('');
    setReseteandoId(usuario.id);
    try {
      const { passwordTemporal: nueva } = await usuarioService.resetearPassword(usuario.id);
      setPasswordTemporal({ usuario, password: nueva });
      setCopiado(false);
    } catch (err) {
      setErrorUsuarios(err.message || 'No se pudo resetear la contraseña');
    } finally {
      setReseteandoId(null);
    }
  }

  async function handleCopiarPassword() {
    try {
      await navigator.clipboard.writeText(passwordTemporal.password);
      setCopiado(true);
    } catch {
      // Sin acceso al portapapeles (permiso denegado): la contraseña sigue visible para copiar a mano.
    }
  }

  function handleExpedienteCreado(id) {
    setModalExpedienteAbierto(false);
    navigate(`/expedientes/${id}`);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Panel de Control</h1>
        <p className="text-sm text-gray-500">Resumen general del sistema · Ley 8968</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Columna izquierda: Usuarios */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1B2A4A]" />
              <h2 className="font-semibold text-[#1B2A4A]">Usuarios</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalUsuarioAbierto(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] rounded-lg px-3 py-1.5 transition-all duration-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Nuevo Usuario
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
            {mensajeUsuarios && (
              <div className="mb-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {mensajeUsuarios}
              </div>
            )}

            {passwordTemporal && (
              <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-amber-800">
                    Contraseña temporal para <strong>{passwordTemporal.usuario.nombre}</strong> (se muestra
                    una sola vez, cópiala y compártesela por fuera del sistema):
                  </p>
                  <button
                    type="button"
                    onClick={() => setPasswordTemporal(null)}
                    className="text-amber-500 hover:text-amber-700 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 bg-white border border-amber-300 rounded-md px-3 py-1.5 text-sm font-mono text-amber-900 select-all">
                    {passwordTemporal.password}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopiarPassword}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors flex-shrink-0"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiado ? 'Copiada' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {errorUsuarios && (
              <div className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorUsuarios}
              </div>
            )}

            {loadingUsuarios ? (
              <div className="text-center text-sm text-gray-500 py-10">Cargando usuarios...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-10">No hay usuarios para este filtro.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="text-[#1B2A4A] text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left py-2">Nombre</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Rol</th>
                      <th className="text-left py-2">Estado</th>
                      <th className="text-right py-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="border-t border-gray-100">
                        <td className="py-2.5 font-medium text-gray-800 max-w-[110px] truncate" title={usuario.nombre}>
                          <span className="inline-flex items-center gap-1">
                            {usuario.esSuperAdmin && (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
                            )}
                            {usuario.nombre}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-600 max-w-[150px] truncate" title={usuario.email}>
                          {usuario.email}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${
                              ROL_BADGE[usuario.rol] || 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${
                              usuario.activo ? ESTADO_BADGE_USUARIO.activo : ESTADO_BADGE_USUARIO.inactivo
                            }`}
                          >
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          {usuario.activo ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleResetearPassword(usuario)}
                                disabled={reseteandoId === usuario.id}
                                title="Resetear contraseña"
                                className="p-1.5 text-[#1B2A4A] border border-[#1B2A4A]/20 rounded-lg hover:bg-[#1B2A4A]/5 disabled:opacity-50 transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              {!usuario.esSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleDesactivar(usuario)}
                                  disabled={desactivandoId === usuario.id}
                                  title="Desactivar"
                                  className="p-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
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
            <button
              type="button"
              onClick={() => setModalExpedienteAbierto(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] rounded-lg px-3 py-1.5 transition-all duration-200"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              Nuevo Expediente
            </button>
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
                <table className="w-full text-sm whitespace-nowrap">
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

      {modalUsuarioAbierto && (
        <NuevoUsuarioModal onClose={() => setModalUsuarioAbierto(false)} onCreado={handleUsuarioCreado} />
      )}

      {modalExpedienteAbierto && (
        <NuevoExpedienteModal
          onClose={() => setModalExpedienteAbierto(false)}
          onCreado={handleExpedienteCreado}
        />
      )}
    </div>
  );
}
