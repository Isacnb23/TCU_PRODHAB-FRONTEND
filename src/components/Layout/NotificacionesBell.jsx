import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as notificacionService from '../../services/notificacionService';

const INTERVALO_REFRESCO_MS = 45000;

function formatFechaHora(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Campana de notificaciones del Header, visible para cualquier usuario autenticado
// (Admin o Usuario). Badge con no leídas + dropdown con la lista; clic en un ítem la
// marca leída y navega al expediente correspondiente según el rol de quien mira.
export default function NotificacionesBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const contenedorRef = useRef(null);

  const [abierto, setAbierto] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  async function cargarConteo() {
    try {
      const { count } = await notificacionService.contarNoLeidas();
      setNoLeidas(count || 0);
    } catch {
      // No intrusivo: si falla el refresco del contador, simplemente no se actualiza.
    }
  }

  useEffect(() => {
    cargarConteo();
    const intervalo = setInterval(cargarConteo, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cierra el dropdown al hacer clic afuera del contenedor (campana + panel).
  useEffect(() => {
    function handleClickFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  async function handleToggle() {
    const next = !abierto;
    setAbierto(next);
    if (next) {
      setCargando(true);
      try {
        const data = await notificacionService.listar();
        setNotificaciones(
          [...(data || [])].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        );
      } catch {
        setNotificaciones([]);
      } finally {
        setCargando(false);
      }
    }
  }

  async function handleClickNotificacion(notif) {
    if (!notif.leida) {
      setNotificaciones((prev) => prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n)));
      setNoLeidas((prev) => Math.max(0, prev - 1));
      try {
        await notificacionService.marcarLeida(notif.id);
      } catch {
        // No intrusivo: si falla, queda marcada como leída localmente igual; no bloquea la navegación.
      }
    }

    setAbierto(false);

    if (notif.expedienteId) {
      const destino = user?.rol === 'Admin' ? `/revision/${notif.expedienteId}` : `/expedientes/${notif.expedienteId}`;
      navigate(destino);
    }
  }

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative text-white/80 hover:text-white transition-colors p-1"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#1B2A4A]">Notificaciones</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando ? (
              <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
            ) : notificaciones.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No tienes notificaciones.</p>
            ) : (
              notificaciones.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleClickNotificacion(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors flex items-start gap-2 ${
                    notif.leida ? 'opacity-60' : 'bg-amber-50/60'
                  }`}
                >
                  {!notif.leida && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                  )}
                  <div className={notif.leida ? 'pl-3.5' : ''}>
                    <p className="text-sm text-gray-800">{notif.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatFechaHora(notif.fechaCreacion)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
