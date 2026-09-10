/**
 * Header.jsx - Encabezado global de la aplicación
 *
 * Responsabilidades:
 * - Logo institucional PRODHAB (versión blanca sobre fondo navy)
 * - Identificación del proyecto (Ley 8968)
 *
 * Nota responsive: el título central usaba posición absoluta centrada sin
 * importar el ancho disponible, así que en ventanas angostas (o con paneles
 * laterales del navegador abiertos) se solapaba con los botones de la
 * derecha. Ahora ese bloque se oculta por debajo de `lg` (el logo ya
 * identifica la marca) para que nunca compita por espacio con la nav.
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
      className="relative h-16 flex-shrink-0 border-b-2 border-[#C9A84C]"
      style={{ background: 'linear-gradient(to right, #1B2A4A, #243761)' }}
    >
      <div className="h-full max-w-full mx-auto px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Logo + nombre (sin caja de fondo) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src={logoProdhab}
            alt="PRODHAB - Agencia de Protección de Datos de los Habitantes"
            className="h-12 md:h-16 w-auto object-contain"
          />
        </div>

        {/* Texto centrado: oculto por debajo de lg para que nunca se solape con la
            nav de la derecha en ventanas angostas o con paneles laterales abiertos. */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-white text-sm">Sistema Web de Protocolos de Actuación</p>
          <p className="text-[#C9A84C] text-xs font-medium">Ley 8968 · Protección de Datos</p>
        </div>

        {/* Usuario + Cerrar sesión */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-0">
          {mostrarVolverExpedientes && (
            <Link
              to="/expedientes"
              className="flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{etiquetaExpedientes}</span>
            </Link>
          )}
          {user?.rol === 'Admin' && (
            <Link
              to="/revision"
              className="text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/40 rounded-lg px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-all duration-200 whitespace-nowrap"
            >
              Revisión
            </Link>
          )}
          {user?.rol === 'Admin' && (
            <Link
              to="/usuarios"
              className="text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/40 rounded-lg px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-all duration-200 whitespace-nowrap"
            >
              Usuarios
            </Link>
          )}
          {user && <NotificacionesBell />}
          {user && (
            <span className="text-white/70 text-xs hidden md:inline truncate max-w-[140px] border-l border-white/20 pl-3">
              {user.nombre || user.email}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="text-xs text-white border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
          >
            Cerrar sesión
          </button>
          <p className="text-white/50 text-xs hidden xl:inline whitespace-nowrap">v1.0.0 | 2026</p>
        </div>
      </div>
    </header>
  );
}