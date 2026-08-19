import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoProdhab from '../../assets/logos/Logo_Prodhab_Azul_Dorado_PNG.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/expedientes', { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#EEF2F7] px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="h-24 flex items-center justify-center border-b-2 border-[#C9A84C]"
          style={{ background: 'linear-gradient(to right, #1B2A4A, #243761)' }}
        >
          <img src={logoProdhab} alt="PRODHAB" className="h-16 w-auto object-contain bg-white/90 rounded px-2 py-1" />
        </div>

        <div className="p-8">
          <h1 className="text-xl font-semibold text-[#1B2A4A] mb-1">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mb-6">Sistema Web de Protocolos de Actuación · Ley 8968</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
                placeholder="usuario@prodhab.go.cr"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-md text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={!loading && email && password ? { backgroundColor: '#1B2A4A' } : undefined}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
