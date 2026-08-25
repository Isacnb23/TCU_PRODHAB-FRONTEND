import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Download, FileWarning, ShieldCheck, ShieldAlert } from 'lucide-react';
import * as expedienteService from '../../services/expedienteService';
import * as subsanacionService from '../../services/subsanacionService';
import PasoCard from './PasoCard';
import AprobarModal from './AprobarModal';
import { PASO_TITULOS, parsearDatosJson } from '../../utils/revisionDisplay';

const ESTADO_BADGE = {
  Borrador: 'bg-gray-100 text-gray-700 border-gray-300',
  Enviado: 'bg-blue-50 text-blue-700 border-blue-200',
  EnRevision: 'bg-amber-50 text-amber-700 border-amber-200',
  RequiereSubsanacion: 'bg-red-50 text-red-700 border-red-200',
  Aprobado: 'bg-green-50 text-green-700 border-green-200',
};

// Color de acento del encabezado, coherente con el badge de cada estado.
const ESTADO_ACCENT = {
  Borrador: '#9CA3AF',
  Enviado: '#3B82F6',
  EnRevision: '#D97706',
  RequiereSubsanacion: '#DC2626',
  Aprobado: '#16A34A',
};

function extensionDeArchivo(nombre) {
  if (!nombre) return 'ARCH';
  const partes = nombre.split('.');
  return partes.length > 1 ? partes.pop().toUpperCase().slice(0, 4) : 'ARCH';
}

function formatFechaHora(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RevisionExpediente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expediente, setExpediente] = useState(null);
  const [subsanaciones, setSubsanaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [observacionesInput, setObservacionesInput] = useState({});
  const [modalAprobarAbierto, setModalAprobarAbierto] = useState(false);
  const [enviandoSubsanacion, setEnviandoSubsanacion] = useState(false);
  const [errorAccion, setErrorAccion] = useState('');

  async function cargar() {
    setLoading(true);
    setError('');
    try {
      const [detalle, subs] = await Promise.all([
        expedienteService.obtener(id),
        subsanacionService.listarPorExpediente(id),
      ]);
      setExpediente(detalle);
      setSubsanaciones(subs || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el expediente');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pasos = useMemo(() => {
    if (!expediente) return [];
    return Array.from({ length: 9 }, (_, i) => {
      const paso = i + 1;
      const fila = expediente.datos.find((d) => d.paso === paso);
      return {
        paso,
        titulo: PASO_TITULOS[paso],
        datos: parsearDatosJson(fila?.datosJson),
        completado: fila?.completado || false,
        observacionesPrevias: expediente.observaciones.filter((o) => o.paso === paso),
      };
    });
  }, [expediente]);

  const puedeActuar = expediente?.estado === 'Enviado';
  const completados = pasos.filter((p) => p.completado).length;
  const progresoPct = pasos.length ? (completados / pasos.length) * 100 : 0;

  const hayObservacionesEscritas = Object.values(observacionesInput).some((v) => (v || '').trim().length > 0);

  function handleChangeObservacion(paso, texto) {
    setObservacionesInput((prev) => ({ ...prev, [paso]: texto }));
  }

  async function handleAprobarConfirmar(numeroExpediente) {
    await expedienteService.aprobar(id, numeroExpediente);
    navigate('/revision', { state: { mensaje: `Expediente aprobado con número ${numeroExpediente}.` } });
  }

  async function handleSolicitarSubsanacion() {
    const observaciones = Object.entries(observacionesInput)
      .filter(([, texto]) => (texto || '').trim().length > 0)
      .map(([paso, texto]) => ({ paso: Number(paso), texto: texto.trim() }));

    if (observaciones.length === 0) return;

    const confirmado = window.confirm(
      `¿Solicitar subsanación en ${observaciones.length} paso(s)? El expediente volverá al usuario para que corrija.`
    );
    if (!confirmado) return;

    setErrorAccion('');
    setEnviandoSubsanacion(true);
    try {
      await expedienteService.solicitarSubsanacion(id, observaciones);
      navigate('/revision', {
        state: { mensaje: `Se solicitó la subsanación en ${observaciones.length} paso(s).` },
      });
    } catch (err) {
      setErrorAccion(err.message || 'No se pudo solicitar la subsanación');
      setEnviandoSubsanacion(false);
    }
  }

  async function handleDescargar(sub) {
    try {
      await subsanacionService.descargarArchivo(id, sub.id, sub.archivoNombre);
    } catch (err) {
      setErrorAccion(err.message || 'No se pudo descargar el archivo');
    }
  }

  if (loading) {
    return <div className="text-center text-sm text-gray-500 py-16">Cargando expediente...</div>;
  }

  if (error || !expediente) {
    return (
      <div className="max-w-3xl mx-auto flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error || 'Expediente no encontrado'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <button
        type="button"
        onClick={() => navigate('/revision')}
        className="flex items-center gap-1.5 text-sm text-[#1B2A4A]/70 hover:text-[#1B2A4A] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la bandeja
      </button>

      {/* Encabezado */}
      <div className="relative bg-white border border-gray-200 rounded-2xl px-6 py-6 mb-6 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ background: ESTADO_ACCENT[expediente.estado] || '#9CA3AF' }}
        />
        <div className="pl-3">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C9A84C] mb-1">
                Expediente · Año {expediente.anio}
              </p>
              <h1 className="text-3xl font-extrabold text-[#1B2A4A] leading-tight">{expediente.entidad}</h1>
            </div>
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${
                ESTADO_BADGE[expediente.estado] || 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {expediente.estado}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-3 mt-5 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Nº Expediente</p>
              <p className="text-gray-800 font-semibold mt-0.5">{expediente.numeroExpediente || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha de envío</p>
              <p className="text-gray-800 font-semibold mt-0.5">{formatFechaHora(expediente.fechaEnvio)}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <span>Progreso del expediente</span>
              <span>{completados}/{pasos.length} pasos completados</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${progresoPct}%`, background: 'linear-gradient(to right, #1B2A4A, #C9A84C)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {errorAccion && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorAccion}
        </div>
      )}

      {/* Pasos */}
      <div className="space-y-4">
        {pasos.map((p) => (
          <PasoCard
            key={p.paso}
            paso={p.paso}
            titulo={p.titulo}
            datos={p.datos}
            completado={p.completado}
            observacionesPrevias={p.observacionesPrevias}
            valorObservacion={observacionesInput[p.paso] || ''}
            onChangeObservacion={(texto) => handleChangeObservacion(p.paso, texto)}
            puedeObservar={puedeActuar}
          />
        ))}
      </div>

      {/* Subsanaciones del usuario */}
      {subsanaciones.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <FileWarning className="w-4 h-4 text-[#1B2A4A]/60" />
            <h3 className="font-semibold text-[#1B2A4A]">Subsanaciones del usuario</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {subsanaciones.map((sub) => (
              <div key={sub.id} className="bg-white border border-gray-200 rounded-xl px-4 py-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#1B2A4A]/70">
                    Paso {sub.paso} · {sub.campo}
                  </span>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                    {formatFechaHora(sub.fechaSubsanacion)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {sub.textoJustificacion || <span className="text-gray-400 italic">Sin justificación escrita.</span>}
                </p>
                {sub.tieneArchivo ? (
                  <button
                    type="button"
                    onClick={() => handleDescargar(sub)}
                    className="flex items-center gap-2.5 w-full text-left bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 rounded-lg px-3 py-2 transition-colors"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded bg-[#1B2A4A]/10 text-[#1B2A4A] text-[10px] font-bold flex-shrink-0">
                      {extensionDeArchivo(sub.archivoNombre)}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-xs font-medium text-gray-700">
                      {sub.archivoNombre || 'archivo'}
                    </span>
                    <Download className="w-3.5 h-3.5 text-[#1B2A4A] flex-shrink-0" />
                  </button>
                ) : (
                  <span className="text-xs text-gray-300">Sin archivo adjunto</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de acciones: cierre de la revisión, fija abajo como el wizard */}
      <div className="sticky bottom-0 mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg shadow-[#1B2A4A]/10 px-6 py-5">
        {puedeActuar ? (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1B2A4A]">Decisión de revisión</p>
              <p className="text-xs text-gray-500 mt-0.5 max-w-md">
                Escribe observaciones en los pasos que correspondan para solicitar subsanación, o aprueba el
                expediente si está completo.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleSolicitarSubsanacion}
                disabled={!hayObservacionesEscritas || enviandoSubsanacion}
                title={!hayObservacionesEscritas ? 'Escribe al menos una observación' : undefined}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-red-700 border-2 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                {enviandoSubsanacion ? 'Enviando...' : 'Solicitar subsanación'}
              </button>
              <button
                type="button"
                onClick={() => setModalAprobarAbierto(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Aprobar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Este expediente está en estado <span className="font-semibold text-gray-700">{expediente.estado}</span>:
            no admite acciones de revisión en este momento.
          </p>
        )}
      </div>

      {modalAprobarAbierto && (
        <AprobarModal onClose={() => setModalAprobarAbierto(false)} onConfirmar={handleAprobarConfirmar} />
      )}
    </div>
  );
}
