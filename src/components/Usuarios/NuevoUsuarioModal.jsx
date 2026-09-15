import { useState } from 'react';
import { X } from 'lucide-react';
import * as usuarioService from '../../services/usuarioService';
import { sugerirEmail } from '../../utils/sugerirEmail';
import SelectEstilizado from '../Common/SelectEstilizado';

export default function NuevoUsuarioModal({ onClose, onCreado }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Usuario');
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  // Email autogenerado a partir del Nombre, como sugerencia inicial editable (no una
  // restricción): se sigue actualizando mientras el Admin no toque el campo Email a mano
  // (o mientras lo que haya ahí siga siendo exactamente la última sugerencia).
  const [emailEditadoManualmente, setEmailEditadoManualmente] = useState(false);
  const [ultimaSugerencia, setUltimaSugerencia] = useState('');

  function handleNombreChange(e) {
    const valor = e.target.value;
    setNombre(valor);

    const sugerencia = sugerirEmail(valor);
    if (!emailEditadoManualmente || email === ultimaSugerencia) {
      setEmail(sugerencia);
    }
    setUltimaSugerencia(sugerencia);
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    setEmailEditadoManualmente(true);
  }

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1B2A4A]">Nuevo Usuario</h2>
            <p className="text-sm text-gray-500 mt-0.5">Crea una cuenta con acceso al sistema.</p>
          </div>
          <button
            onClick={onClose}
            disabled={creando}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 -mr-1.5 -mt-1.5 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={handleNombreChange}
              placeholder="Nombre completo"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-colors"
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="correo@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-colors"
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-colors"
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <SelectEstilizado
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              disabled={creando}
            >
              <option value="Usuario">Usuario</option>
              <option value="Admin">Admin</option>
            </SelectEstilizado>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-100">
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
