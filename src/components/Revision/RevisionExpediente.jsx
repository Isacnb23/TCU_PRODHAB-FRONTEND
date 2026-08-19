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
      <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{expediente.entidad}</h1>
            <p className="text-sm text-gray-500">Año {expediente.anio}</p>
          </div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
              ESTADO_BADGE[expediente.estado] || 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            {expediente.estado}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm">
          <div>
            <span className="text-gray-400">Nº Expediente: </span>
            <span className="text-gray-700 font-medium">{expediente.numeroExpediente || 'Sin asignar'}</span>
          </div>
          <div>
            <span className="text-gray-400">Fecha de envío: </span>
            <span className="text-gray-700 font-medium">{formatFechaHora(expediente.fechaEnvio)}</span>
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
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            <FileWarning className="w-4 h-4 text-[#1B2A4A]/60" />
            <h3 className="font-semibold text-[#1B2A4A]">Subsanaciones del usuario</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-2">Paso</th>
                  <th className="text-left px-5 py-2">Campo</th>
                  <th className="text-left px-5 py-2">Justificación</th>
                  <th className="text-left px-5 py-2">Fecha</th>
                  <th className="text-right px-5 py-2">Archivo</th>
                </tr>
              </thead>
              <tbody>
                {subsanaciones.map((sub) => (
                  <tr key={sub.id} className="border-t border-gray-100">
                    <td className="px-5 py-2.5 text-gray-700">{sub.paso}</td>
                    <td className="px-5 py-2.5 text-gray-700">{sub.campo}</td>
                    <td className="px-5 py-2.5 text-gray-600">{sub.textoJustificacion || '—'}</td>
                    <td className="px-5 py-2.5 text-gray-500">{formatFechaHora(sub.fechaSubsanacion)}</td>
                    <td className="px-5 py-2.5 text-right">
                      {sub.tieneArchivo ? (
                        <button
                          type="button"
                          onClick={() => handleDescargar(sub)}
                          className="inline-flex items-center gap-1 text-[#1B2A4A] font-semibold text-xs hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="mt-6">
        {puedeActuar ? (
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500">
              Escribe observaciones en los pasos que correspondan para solicitar subsanación, o aprueba el
              expediente si está completo.
            </p>
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
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-500">
            Este expediente está en estado <span className="font-semibold">{expediente.estado}</span>: no admite
            acciones de revisión en este momento.
          </div>
        )}
      </div>

      {modalAprobarAbierto && (
        <AprobarModal onClose={() => setModalAprobarAbierto(false)} onConfirmar={handleAprobarConfirmar} />
      )}
    </div>
  );
}
