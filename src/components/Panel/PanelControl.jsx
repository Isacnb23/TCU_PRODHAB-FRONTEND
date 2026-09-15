import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  FilePlus2,
  KeyRound,
  Copy,
  Check,
  X,
  UserX,
  ShieldCheck,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as expedienteService from '../../services/expedienteService';
import * as usuarioService from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';
import { etiquetaEstado, claseEstado } from '../../utils/estadoLabel';
import SelectEstilizado from '../Common/SelectEstilizado';
import NuevoUsuarioModal from '../Usuarios/NuevoUsuarioModal';
import NuevoExpedienteModal from '../Expedientes/NuevoExpedienteModal';

const ROL_BADGE = {
  Admin: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/20',
  Usuario: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ROL_DOT = {
  Admin: 'bg-[#1B2A4A]',
  Usuario: 'bg-blue-500',
};

const ESTADO_BADGE_USUARIO = {
  activo: 'bg-green-50 text-green-700 border-green-200',
  inactivo: 'bg-gray-100 text-gray-500 border-gray-200',
};

const AVATAR_COLORES = [
  'bg-[#1B2A4A]/10 text-[#1B2A4A]',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
];

function colorAvatar(texto) {
  const codigo = (texto || '').charCodeAt(0) || 0;
  return AVATAR_COLORES[codigo % AVATAR_COLORES.length];
}

const OPCIONES_ROL = [
  { value: '', label: 'Todos' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Usuario', label: 'Usuario' },
];

const OPCIONES_ESTADO_EXPEDIENTE = [
  { value: '', label: 'Todos' },
  { value: 'Borrador', label: 'Borrador' },
  { value: 'Enviado', label: 'Pendientes de revisión' },
  { value: 'RequiereSubsanacion', label: 'Requiere Subsanación' },
  { value: 'Aprobado', label: 'Aprobados' },
];

const FILAS_POR_PAGINA = 8;

function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Encabezado de sección reutilizado por Expedientes y Usuarios: icono en badge de
// color, título + conteo como subtítulo, y el botón de acción (Nuevo X) a la derecha.
function EncabezadoSeccion({ icono: Icono, titulo, conteo, textoBoton, iconoBoton: IconoBoton, onClick }) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1B2A4A] text-white shadow-sm shadow-[#1B2A4A]/20">
          <Icono className="w-5 h-5" />
        </span>
        <div>
          <h2 className="font-bold text-[#1B2A4A] leading-tight">{titulo}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {conteo === 1 ? '1 registro' : `${conteo} registros`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] rounded-full pl-3.5 pr-4 py-2 shadow-sm shadow-[#1B2A4A]/20 hover:shadow-md hover:shadow-[#1B2A4A]/25 transition-all duration-200"
      >
        <IconoBoton className="w-3.5 h-3.5" />
        {textoBoton}
      </button>
    </div>
  );
}

function EstadoVacio({ icono: Icono, texto }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
        <Icono className="w-6 h-6 text-gray-300" />
      </span>
      <p className="text-sm text-gray-400">{texto}</p>
    </div>
  );
}

// Paginador reutilizado por Expedientes y Usuarios: para que la tabla no crezca sin
// límite a medida que se acumulan registros, se corta en páginas fijas en vez de
// mostrar todo de una vez (o depender de scroll infinito dentro de la card).
function Paginador({ paginaActual, totalPaginas, total, onCambiar }) {
  if (totalPaginas <= 1) return null;

  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA + 1;
  const fin = Math.min(paginaActual * FILAS_POR_PAGINA, total);

  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        {inicio}–{fin} de {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onCambiar(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1B2A4A] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-gray-500 px-2 whitespace-nowrap">
          Página {paginaActual} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onCambiar(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1B2A4A] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function PanelControl() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
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
  const [paginaExpedientes, setPaginaExpedientes] = useState(1);
  const [modalExpedienteAbierto, setModalExpedienteAbierto] = useState(false);
  // Mensaje de éxito al volver de aprobar/solicitar subsanación en /revision/:id
  // (esa pantalla ya no tiene su propia bandeja a la que volver, así que el
  // mensaje viaja hasta acá por location.state, igual que hacía RevisionBandeja).
  const [mensajeExpedientes, setMensajeExpedientes] = useState(location.state?.mensaje || '');

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
    // Limpiar el mensaje del state para que no reaparezca en un refresh manual.
    if (location.state?.mensaje) {
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El mensaje de éxito (aprobar/subsanar) es notorio pero no debe quedarse pegado para siempre.
  useEffect(() => {
    if (!mensajeExpedientes) return;
    const timer = setTimeout(() => setMensajeExpedientes(''), 6000);
    return () => clearTimeout(timer);
  }, [mensajeExpedientes]);

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
  const totalPaginasUsuarios = Math.max(1, Math.ceil(usuariosFiltrados.length / FILAS_POR_PAGINA));
  const usuariosPagina = usuariosFiltrados.slice(
    (paginaUsuarios - 1) * FILAS_POR_PAGINA,
    paginaUsuarios * FILAS_POR_PAGINA
  );
  const totalPaginasExpedientes = Math.max(1, Math.ceil(expedientes.length / FILAS_POR_PAGINA));
  const expedientesPagina = expedientes.slice(
    (paginaExpedientes - 1) * FILAS_POR_PAGINA,
    paginaExpedientes * FILAS_POR_PAGINA
  );

  // Si la lista se encoge (filtro, desactivar, etc.) y la página actual quedó
  // fuera de rango, la regresa a la última página válida en vez de mostrar vacío.
  useEffect(() => {
    if (paginaUsuarios > totalPaginasUsuarios) setPaginaUsuarios(totalPaginasUsuarios);
  }, [paginaUsuarios, totalPaginasUsuarios]);

  useEffect(() => {
    if (paginaExpedientes > totalPaginasExpedientes) setPaginaExpedientes(totalPaginasExpedientes);
  }, [paginaExpedientes, totalPaginasExpedientes]);

  function handleFiltroRolChange(valor) {
    setFiltroRol(valor);
    setPaginaUsuarios(1);
  }

  function handleFiltroEstadoChange(valor) {
    setFiltroEstado(valor);
    setPaginaExpedientes(1);
  }

  function handleUsuarioCreado(usuario) {
    setModalUsuarioAbierto(false);
    setMensajeUsuarios(`Usuario "${usuario.nombre}" creado correctamente.`);
    setPaginaUsuarios(1);
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
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold text-[#1B2A4A] tracking-tight">Panel de Control</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen general del sistema · Ley 8968</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Expedientes primero: ancho completo (no en 2 columnas) para que ninguna
            tabla necesite su propio scroll horizontal. */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <EncabezadoSeccion
            icono={FolderOpen}
            titulo="Expedientes"
            conteo={expedientes.length}
            textoBoton="Nuevo Expediente"
            iconoBoton={FilePlus2}
            onClick={() => setModalExpedienteAbierto(true)}
          />

          <div className="px-6 pt-5">
            <div className="w-56">
              <SelectEstilizado value={filtroEstado} onChange={(e) => handleFiltroEstadoChange(e.target.value)}>
                {OPCIONES_ESTADO_EXPEDIENTE.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </SelectEstilizado>
            </div>
          </div>

          <div className="p-6 pt-4">
            {mensajeExpedientes && (
              <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {mensajeExpedientes}
              </div>
            )}

            {errorExpedientes && (
              <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorExpedientes}
              </div>
            )}

            {loadingExpedientes ? (
              <div className="text-center text-sm text-gray-400 py-12">Cargando expedientes...</div>
            ) : errorExpedientes ? null : expedientes.length === 0 ? (
              <EstadoVacio icono={Inbox} texto="No hay expedientes para este filtro." />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-[#1B2A4A]/60 text-[11px] uppercase tracking-wider">
                      <th className="text-left font-bold py-2.5 px-2">Entidad</th>
                      <th className="text-left font-bold py-2.5 px-4">Año</th>
                      <th className="text-left font-bold py-2.5 px-4">Estado</th>
                      <th className="text-left font-bold py-2.5 px-4">Últ. modificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expedientesPagina.map((exp) => (
                      <tr
                        key={exp.id}
                        onClick={() => navigate(`/revision/${exp.id}`)}
                        className="group border-t border-gray-100 hover:bg-[#1B2A4A]/[0.03] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-2 font-semibold text-gray-800 group-hover:text-[#1B2A4A] transition-colors">
                          {exp.entidad}
                        </td>
                        <td className="py-3 px-4 text-gray-500">{exp.anio}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${claseEstado(
                              exp.estado,
                              exp.tieneObservacionesPrevias
                            )}`}
                          >
                            {etiquetaEstado(exp.estado, user?.rol, exp.tieneObservacionesPrevias)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{formatFecha(exp.fechaModificacion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Paginador
                  paginaActual={paginaExpedientes}
                  totalPaginas={totalPaginasExpedientes}
                  total={expedientes.length}
                  onCambiar={setPaginaExpedientes}
                />
              </div>
            )}
          </div>
        </div>

        {/* Usuarios debajo, también a ancho completo */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <EncabezadoSeccion
            icono={Users}
            titulo="Usuarios"
            conteo={usuariosFiltrados.length}
            textoBoton="Nuevo Usuario"
            iconoBoton={UserPlus}
            onClick={() => setModalUsuarioAbierto(true)}
          />

          <div className="px-6 pt-5">
            <div className="w-40">
              <SelectEstilizado value={filtroRol} onChange={(e) => handleFiltroRolChange(e.target.value)}>
                {OPCIONES_ROL.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </SelectEstilizado>
            </div>
          </div>

          <div className="p-6 pt-4">
            {mensajeUsuarios && (
              <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {mensajeUsuarios}
              </div>
            )}

            {passwordTemporal && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-amber-800">
                    Contraseña temporal para <strong>{passwordTemporal.usuario.nombre}</strong> (se muestra
                    una sola vez, cópiala y compártesela por fuera del sistema):
                  </p>
                  <button
                    type="button"
                    onClick={() => setPasswordTemporal(null)}
                    className="text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-full p-1 -mt-1 -mr-1 flex-shrink-0 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <code className="flex-1 bg-white border border-amber-300 rounded-lg px-3.5 py-2 text-sm font-mono text-amber-900 select-all">
                    {passwordTemporal.password}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopiarPassword}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 border border-amber-300 rounded-lg px-3.5 py-2 hover:bg-amber-100 transition-colors flex-shrink-0"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiado ? 'Copiada' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {errorUsuarios && (
              <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorUsuarios}
              </div>
            )}

            {loadingUsuarios ? (
              <div className="text-center text-sm text-gray-400 py-12">Cargando usuarios...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <EstadoVacio icono={Users} texto="No hay usuarios para este filtro." />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-[#1B2A4A]/60 text-[11px] uppercase tracking-wider">
                      <th className="text-left font-bold py-2.5 px-2">Nombre</th>
                      <th className="text-left font-bold py-2.5 px-4">Email</th>
                      <th className="text-left font-bold py-2.5 px-4">Rol</th>
                      <th className="text-left font-bold py-2.5 px-4">Estado</th>
                      <th className="text-right font-bold py-2.5 px-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosPagina.map((usuario) => (
                      <tr key={usuario.id} className="border-t border-gray-100 hover:bg-[#1B2A4A]/[0.03] transition-colors">
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center gap-2.5">
                            <span
                              className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold flex-shrink-0 ${colorAvatar(
                                usuario.nombre
                              )}`}
                            >
                              {(usuario.nombre || '?').trim().charAt(0).toUpperCase()}
                            </span>
                            <span className="font-semibold text-gray-800 inline-flex items-center gap-1">
                              {usuario.nombre}
                              {usuario.esSuperAdmin && (
                                <ShieldCheck
                                  className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0"
                                  title="Superusuario"
                                />
                              )}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500" title={usuario.email}>
                          {usuario.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              ROL_BADGE[usuario.rol] || 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${ROL_DOT[usuario.rol] || 'bg-gray-400'}`} />
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              usuario.activo ? ESTADO_BADGE_USUARIO.activo : ESTADO_BADGE_USUARIO.inactivo
                            }`}
                          >
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
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
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Paginador
                  paginaActual={paginaUsuarios}
                  totalPaginas={totalPaginasUsuarios}
                  total={usuariosFiltrados.length}
                  onCambiar={setPaginaUsuarios}
                />
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
