import { useEffect, useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as usuarioService from '../../services/usuarioService';
import NuevoUsuarioModal from './NuevoUsuarioModal';

const ROL_BADGE = {
  Admin: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/30',
  Usuario: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ESTADO_BADGE = {
  activo: 'bg-green-50 text-green-700 border-green-200',
  inactivo: 'bg-gray-100 text-gray-600 border-gray-300',
};

function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [desactivandoId, setDesactivandoId] = useState(null);

  async function cargar() {
    setLoading(true);
    setError('');
    try {
      const data = await usuarioService.listar();
      setUsuarios(data || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function handleCreado(usuario) {
    setModalAbierto(false);
    setMensaje(`Usuario "${usuario.nombre}" creado correctamente.`);
    cargar();
  }

  async function handleDesactivar(usuario) {
    const confirmado = window.confirm(`¿Desactivar a ${usuario.nombre}? No podrá iniciar sesión.`);
    if (!confirmado) return;

    setError('');
    setMensaje('');
    setDesactivandoId(usuario.id);
    try {
      await usuarioService.desactivar(usuario.id);
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, activo: false } : u)));
    } catch (err) {
      setError(err.message || 'No se pudo desactivar el usuario');
    } finally {
      setDesactivandoId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500">Cuentas con acceso al sistema · Ley 8968</p>
        </div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] shadow-lg shadow-[#1B2A4A]/20 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
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
        <div className="text-center text-sm text-gray-500 py-16">Cargando usuarios...</div>
      ) : error && usuarios.length === 0 ? null : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#1B2A4A]/5 text-[#1B2A4A] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Nombre</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Rol</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Fecha de creación</th>
                <th className="text-right px-5 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-medium text-gray-800">{usuario.nombre}</td>
                  <td className="px-5 py-3 text-gray-600">{usuario.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        ROL_BADGE[usuario.rol] || 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        usuario.activo ? ESTADO_BADGE.activo : ESTADO_BADGE.inactivo
                      }`}
                    >
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{formatFecha(usuario.fechaCreacion)}</td>
                  <td className="px-5 py-3 text-right">
                    {usuario.activo ? (
                      <button
                        type="button"
                        onClick={() => handleDesactivar(usuario)}
                        disabled={desactivandoId === usuario.id}
                        className="text-xs font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {desactivandoId === usuario.id ? 'Desactivando...' : 'Desactivar'}
                      </button>
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

      {modalAbierto && (
        <NuevoUsuarioModal onClose={() => setModalAbierto(false)} onCreado={handleCreado} />
      )}
    </div>
  );
}
