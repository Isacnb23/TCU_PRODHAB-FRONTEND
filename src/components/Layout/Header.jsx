/**
 * Header.jsx - Encabezado global de la aplicación
 *
 * Responsabilidades:
 * - Logo institucional PRODHAB (versión blanca sobre fondo navy)
 * - Identificación del proyecto (Ley 8968)
 */

// Logo oficial PRODHAB en blanco (PNG transparente, resuelto por Vite)
import logoProdhab from '../../assets/logos/Logo_Prodhab_Blanco_Dorado_PNG.png';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificacionesBell from './NotificacionesBell';

export default function Header({ mostrarVolverExpedientes = false }) {
  const { user, logout } = useAuth();

  // Para el Admin, "Mis Expedientes" confunde con la Bandeja de Revisión (ahí llegan
  // los de otros). El Admin puede seguir creando/gestionando los suyos, solo cambia
  // la etiqueta para que no suene a "mis" cuando su rol principal es revisar los ajenos.
  const etiquetaExpedientes = user?.rol === 'Admin' ? 'Expedientes' : 'Mis Expedientes';

  return (
    <header
      className="relative h-16 flex-shrink-0 border-b-2 border-[#C9A84C] shadow-md shadow-black/10"
      style={{ background: 'linear-gradient(to right, #1B2A4A, #243761)' }}
    >
      <div className="h-full max-w-full mx-auto px-6 flex items-center justify-between">
        {/* Logo + nombre (sin caja de fondo) */}
        <div className="flex items-center gap-3">
          <img
            src={logoProdhab}
            alt="PRODHAB - Agencia de Protección de Datos de los Habitantes"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Texto centrado absolutamente en el header */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <p className="text-white text-sm">Sistema Web de Protocolos de Actuación</p>
          <p className="text-[#C9A84C] text-xs font-medium">Ley 8968 · Protección de Datos</p>
        </div>

        {/* Usuario + Cerrar sesión */}
        <div className="flex items-center gap-5">
          {mostrarVolverExpedientes && (
            <Link
              to="/expedientes"
              className="flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {etiquetaExpedientes}
            </Link>
          )}
          {user?.rol === 'Admin' && (
            <Link
              to="/revision"
              className="text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/40 rounded-lg px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-all duration-200"
            >
              Revisión
            </Link>
          )}
          {user?.rol === 'Admin' && (
            <Link
              to="/usuarios"
              className="text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/40 rounded-lg px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-all duration-200"
            >
              Usuarios
            </Link>
          )}
          {user && <NotificacionesBell />}
          {user && (
            <span className="text-white/70 text-xs hidden sm:inline border-l border-white/20 pl-5">
              {user.nombre || user.email}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="text-xs text-white border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-all duration-200"
          >
            Cerrar sesión
          </button>
          <p className="text-white/50 text-xs hidden lg:inline">v1.0.0 | 2026</p>
        </div>
      </div>
    </header>
  );
}