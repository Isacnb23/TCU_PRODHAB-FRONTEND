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
      <div className="h-full max-w-full mx-auto px-4 sm:px-6 grid grid-cols-[auto_1fr_minmax(0,auto)] items-center gap-3">
        {/* Logo + nombre (sin caja de fondo) */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logoProdhab}
            alt="PRODHAB - Agencia de Protección de Datos de los Habitantes"
            className="h-12 w-auto object-contain sm:h-16"
          />
        </div>

        {/* Texto centrado: en grid (no absoluto) para que nunca se solape con el
            logo ni con el nav, sin importar cuánto ocupen — a diferencia de un
            posicionamiento absoluto, la columna central de un grid nunca invade
            el espacio de las columnas vecinas. Oculto por debajo de 'xl' porque
            con el nav completo del Admin no queda espacio limpio para mostrarlo. */}
        <div className="hidden xl:flex flex-col items-center justify-center text-center min-w-0 px-2">
          <p className="text-white text-sm truncate max-w-full">Sistema Web de Protocolos de Actuación</p>
          <p className="text-[#C9A84C] text-xs font-medium truncate max-w-full">Ley 8968 · Protección de Datos</p>
        </div>

        {/* Usuario + Cerrar sesión. min-w-0 + overflow-x-auto: si en pantallas
            angostas el nav del Admin (4 links + campana + logout) no entra,
            esta franja scrollea horizontalmente ella sola en vez de forzar
            todo el body a hacerlo (lo que rompía el layout completo). */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0 overflow-x-auto">
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
              className="text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/40 rounded-lg px-3 py-1.5 whitespace-nowrap flex-shrink-0 hover:bg-[#C9A84C]/10 transition-all duration-200"
            >
              Panel
            </Link>
          )}
          {user && (
            <span className="flex-shrink-0">
              <NotificacionesBell />
            </span>
          )}
          {user && (
            <span className="text-white/70 text-xs hidden xl:inline whitespace-nowrap flex-shrink-0 border-l border-white/20 pl-5">
              {user.nombre || user.email}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="text-xs text-white border border-white/30 rounded-lg px-3 py-1.5 whitespace-nowrap flex-shrink-0 hover:bg-white/10 transition-all duration-200"
          >
            Cerrar sesión
          </button>
          <p className="text-white/50 text-xs hidden lg:inline whitespace-nowrap flex-shrink-0">v1.0.0 | 2026</p>
        </div>
      </div>
    </header>
  );
}