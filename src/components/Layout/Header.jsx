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
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificacionesBell from './NotificacionesBell';

export default function Header({ mostrarVolverExpedientes = false }) {
  const { user, logout } = useAuth();

  // Para el Admin, "Mis Expedientes" confunde con la Bandeja de Revisión (ahí llegan
  // los de otros). El Admin puede seguir creando/gestionando los suyos, solo cambia
  // la etiqueta para que no suene a "mis" cuando su rol principal es revisar los ajenos.
  const etiquetaExpedientes = user?.rol === 'Admin' ? 'Expedientes' : 'Mis Expedientes';
  const inicial = (user?.nombre || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header
      className="relative h-16 flex-shrink-0 border-b border-[#C9A84C]/70 shadow-lg shadow-black/20"
      style={{ background: 'linear-gradient(115deg, #16223d, #1B2A4A 45%, #263c68)' }}
    >
      <div className="h-full max-w-full mx-auto px-4 sm:px-6 grid grid-cols-[auto_1fr_minmax(0,auto)] items-center gap-3">
        {/* Logo + nombre (sin caja de fondo) */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logoProdhab}
            alt="PRODHAB - Agencia de Protección de Datos de los Habitantes"
            className="h-11 w-auto object-contain sm:h-[3.75rem]"
          />
        </div>

        {/* Texto centrado: en grid (no absoluto) para que nunca se solape con el
            logo ni con el nav, sin importar cuánto ocupen — a diferencia de un
            posicionamiento absoluto, la columna central de un grid nunca invade
            el espacio de las columnas vecinas. Oculto por debajo de 'xl' porque
            con el nav completo del Admin no queda espacio limpio para mostrarlo. */}
        <div className="hidden xl:flex flex-col items-center justify-center text-center min-w-0 px-2">
          <p className="text-white text-[13px] font-medium tracking-wide truncate max-w-full">
            Sistema Web de Protocolos de Actuación
          </p>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] text-[#C9A84C] uppercase truncate max-w-full mt-0.5">
            <span className="w-1 h-1 rounded-full bg-[#C9A84C] flex-shrink-0" />
            Ley 8968 · Protección de Datos
          </p>
        </div>

        {/* Usuario + Cerrar sesión. Dos grupos separados a propósito: los links de
            nav van en su propia franja con overflow-x-auto (si en pantallas angostas
            no entran, scrollean solos en vez de forzar todo el body a hacerlo), pero
            la campana/usuario/logout NUNCA deben ir ahí — un dropdown con position
            absolute no puede escapar de un ancestro con overflow distinto de visible,
            así que quedaría recortado (le pasó al dropdown de notificaciones). Ese
            segundo grupo es liviano y con los pills ya reducidos a uno solo (Panel),
            no necesita scroll propio. */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
            {mostrarVolverExpedientes && (
              <Link
                to="/expedientes"
                className="flex items-center gap-1.5 text-xs font-semibold text-white/80 whitespace-nowrap flex-shrink-0 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {etiquetaExpedientes}
              </Link>
            )}
            {/* El Admin tiene un solo destino en el nav: el Panel concentra usuarios y
                expedientes (crear, desactivar, resetear contraseña, crear expediente).
                Expedientes/Revisión/Usuarios siguen existiendo como rutas (accesibles
                desde el propio Panel o por URL), solo dejaron de ser links del menú. */}
            {user?.rol === 'Admin' && (
              <Link
                to="/panel"
                className="text-xs font-semibold tracking-wide text-[#C9A84C] border border-[#C9A84C]/40 rounded-full px-4 py-1.5 whitespace-nowrap flex-shrink-0 hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/70 transition-all duration-200"
              >
                Panel
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user && <NotificacionesBell />}
            {user && (
              <span className="hidden xl:flex items-center gap-2 whitespace-nowrap border-l border-white/15 pl-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-[11px] font-bold">
                  {inicial}
                </span>
                <span className="text-white/70 text-xs">{user.nombre || user.email}</span>
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 text-xs font-medium text-white/90 border border-white/25 rounded-full px-3.5 py-1.5 whitespace-nowrap hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
            <p className="text-white/40 text-[11px] hidden lg:inline whitespace-nowrap tracking-wide">
              v1.0.0 · 2026
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
