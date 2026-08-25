import { useState } from 'react';
import { X } from 'lucide-react';
import * as usuarioService from '../../services/usuarioService';

export default function NuevoUsuarioModal({ onClose, onCreado }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Usuario');
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  const nombreValido = nombre.trim().length > 0;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValido = password.length >= 6;
  const formValido = nombreValido && emailValido && passwordValido;

  async function handleCrear() {
    if (!formValido) return;
    setError('');
    setCreando(true);
    try {
      const usuario = await usuarioService.crear({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        rol,
      });
      onCreado(usuario);
    } catch (err) {
      // 409 (email duplicado) u otro error del backend: se muestra en el modal, sin cerrarlo.
      setError(err.message || 'No se pudo crear el usuario');
      setCreando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Nuevo Usuario</h2>
          <button onClick={onClose} disabled={creando} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
              disabled={creando}
            >
              <option value="Usuario">Usuario</option>
              <option value="Admin">Admin</option>
            </select>
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
              disabled={!formValido || creando}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {creando ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
