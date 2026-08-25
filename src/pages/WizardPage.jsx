import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import WizardContainer from '../components/Wizard/WizardContainer';
import * as expedienteService from '../services/expedienteService';
import * as subsanacionService from '../services/subsanacionService';
import { fusionarDatosPaso } from '../utils/pasoMapper';

const FORM_DATA_INICIAL = {
  step1_general: {},
  step2_inventario: {},
  step3_amenazas: {},
  step4_finalidad: {},
  step5_transferencia: {},
  step6_riesgos: {},
  step7_seguridad: {},
  step8_adicionales: {},
  step9_revision: {},
};

export default function WizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(FORM_DATA_INICIAL);
  const [currentStep, setCurrentStep] = useState(1);
  const [estado, setEstado] = useState('Borrador');
  // Metadata del expediente (entidad, año, número asignado, fecha de envío) que
  // Step9_Revision necesita para generar la portada/nombre del Excel una vez
  // Aprobado. Separado de `estado` porque ya existía como su propio state y no
  // quería duplicar esa lectura en dos lugares.
  const [expedienteMeta, setExpedienteMeta] = useState({});
  const [observaciones, setObservaciones] = useState([]);
  const [subsanaciones, setSubsanaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const recargarSubsanaciones = useCallback(async () => {
    try {
      const data = await subsanacionService.listarPorExpediente(id);
      setSubsanaciones(data || []);
    } catch {
      // No intrusivo: si falla el refresco, la lista simplemente no se actualiza.
    }
  }, [id]);

  // Cargar el expediente del backend y rehidratar el formData al entrar (o cambiar de id)
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      setError('');
      try {
        const expediente = await expedienteService.obtener(id);
        if (cancelado) return;

        // Respaldo local de ESTE expediente como base; los datos del backend
        // (que aún puede no tener nada, ya que el guardado por paso es Parte 2b)
        // tienen prioridad y sobrescriben paso a paso sobre ese respaldo.
        let datos = FORM_DATA_INICIAL;
        const respaldoLocal = localStorage.getItem(`prodhab_formData_${id}`);
        if (respaldoLocal) {
          try {
            datos = { ...FORM_DATA_INICIAL, ...JSON.parse(respaldoLocal) };
          } catch {
            datos = FORM_DATA_INICIAL;
          }
        }

        (expediente.datos || []).forEach((entrada) => {
          const datosPaso =
            typeof entrada.datosJson === 'string'
              ? JSON.parse(entrada.datosJson)
              : entrada.datosJson || {};
          datos = fusionarDatosPaso(datos, entrada.paso, datosPaso);
        });

        // Reflejar entidad/año del expediente en el Paso 1 si ese paso aún no los trae
        datos = {
          ...datos,
          step1_general: {
            ...datos.step1_general,
            entidad: datos.step1_general?.entidad || expediente.entidad || '',
            ano: datos.step1_general?.ano || expediente.anio || new Date().getFullYear(),
          },
        };

        setFormData(datos);
        setEstado(expediente.estado);
        setExpedienteMeta({
          entidad: expediente.entidad,
          anio: expediente.anio,
          numeroExpediente: expediente.numeroExpediente,
          estado: expediente.estado,
          fechaEnvio: expediente.fechaEnvio,
        });
        setObservaciones(expediente.observaciones || []);

        const respaldoStep = localStorage.getItem(`prodhab_currentStep_${id}`);
        const pasoInicial = expediente.pasoActual || (respaldoStep ? parseInt(respaldoStep, 10) : 1);
        setCurrentStep(pasoInicial || 1);

        // Solo hace falta traer subsanaciones si el usuario puede llegar a verlas/adjuntar
        // (RequiereSubsanacion); en Borrador nunca hay, y en Enviado/Aprobado es solo lectura.
        if (expediente.estado === 'RequiereSubsanacion') {
          subsanacionService
            .listarPorExpediente(id)
            .then((data) => {
              if (!cancelado) setSubsanaciones(data || []);
            })
            .catch(() => {});
        }
      } catch (err) {
        if (cancelado) return;
        if (err.status === 404) {
          setError('No se encontró el expediente');
        } else if (err.status === 403) {
          setError('No tienes acceso a este expediente');
        } else {
          setError(err.message || 'No se pudo cargar el expediente');
        }
        setTimeout(() => {
          if (!cancelado) navigate('/expedientes', { replace: true });
        }, 1800);
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [id, navigate]);

  // Respaldo en localStorage POR expediente (no se pisa con el de otros expedientes)
  useEffect(() => {
    if (loading) return;
    localStorage.setItem(`prodhab_formData_${id}`, JSON.stringify(formData));
    localStorage.setItem(`prodhab_currentStep_${id}`, currentStep.toString());
  }, [formData, currentStep, id, loading]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF2F7]">
        <p className="text-[#1B2A4A] text-sm">Cargando expediente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF2F7]">
        <div className="text-center">
          <p className="text-red-600 text-sm font-medium mb-1">{error}</p>
          <p className="text-gray-400 text-xs">Regresando a Mis Expedientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#EEF2F7]">
      <Header mostrarVolverExpedientes />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <main className="flex-1 overflow-y-auto bg-[#F0F4F8] p-8">
          <WizardContainer
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            formData={formData}
            setFormData={setFormData}
            expedienteId={id}
            estado={estado}
            expedienteMeta={expedienteMeta}
            readOnly={estado !== 'Borrador' && estado !== 'RequiereSubsanacion'}
            observaciones={observaciones}
            subsanaciones={subsanaciones}
            onSubsanacionesChange={recargarSubsanaciones}
          />
        </main>
      </div>
    </div>
  );
}