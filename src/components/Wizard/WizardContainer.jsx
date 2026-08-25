import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import StepIndicator from './StepIndicator';
import NavigationButtons from './NavigationButtons';
import ObservacionesResumen from './ObservacionesResumen';
import CampoObservacion from './CampoObservacion';
import * as expedienteService from '../../services/expedienteService';
import { extraerDatosPaso } from '../../utils/pasoMapper';
import { tieneCampoConocido } from '../../utils/camposConocidos';
import Step1_General from '../Forms/Step1_General';
import Step2_Inventario from '../Forms/Step2_Inventario';
import Step3_Amenazas from '../Forms/Step3_Amenazas';
import Step4_Finalidad from '../Forms/Step4_Finalidad';
import Step5_Transferencia from '../Forms/Step5_Transferencia';
import Step6_Riesgos from '../Forms/Step6_Riesgos';
import Step7_Seguridad from '../Forms/Step7_Seguridad';
import Step8_Adicionales from '../Forms/Step8_Adicionales';
import Step9_Revision from '../Forms/Step9_Revision';

/**
 * WizardContainer.jsx - Contenedor maestro del wizard
 * 
 * Responsabilidades:
 * - Gestionar qué paso se muestra
 * - Controlar navegación (siguiente/atrás)
 * - Validar datos antes de avanzar
 * - Coordinar todos los pasos
 * - Guardar progreso automáticamente
 */

const TOTAL_STEPS = 9;
// El paso 9 es la revisión/envío en sí: no se exige "completado" para poder enviar.
const PASOS_REQUERIDOS_PARA_ENVIO = 8;

const STEPS_COMPONENTS = [
  Step1_General,
  Step2_Inventario,
  Step3_Amenazas,
  Step4_Finalidad,
  Step5_Transferencia,
  Step6_Riesgos,
  Step7_Seguridad,
  Step8_Adicionales,
  Step9_Revision,
];

export default function WizardContainer({
  currentStep,
  setCurrentStep,
  formData,
  setFormData,
  expedienteId,
  estado,
  readOnly = false,
  observaciones = [],
  subsanaciones = [],
  onSubsanacionesChange = async () => {},
  // Metadata del expediente (entidad, año, número asignado, fecha de envío) que
  // Step9_Revision necesita para generar el nombre/portada del Excel una vez
  // Aprobado. WizardPage debe pasarlo armado desde el expediente que ya tiene
  // cargado, ej:
  //   expedienteMeta={{
  //     entidad: expediente.entidad,
  //     anio: expediente.anio,
  //     numeroExpediente: expediente.numeroExpediente,
  //     estado: expediente.estado,
  //     fechaEnvio: expediente.fechaEnvio,
  //   }}
  expedienteMeta = {},
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [saveWarning, setSaveWarning] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviarError, setEnviarError] = useState(null);

  // Misma noción de completitud que ya alimenta los chips "Completados X / Falta Y"
  // del StepIndicator (completados = currentStep - 1): en el paso 9, eso equivale a
  // haber completado los 8 pasos requeridos.
  const puedeEnviar = currentStep - 1 >= PASOS_REQUERIDOS_PARA_ENVIO;

  // El aviso de error de envío es específico del intento; no debe seguir viéndose
  // si el usuario navega a otro paso.
  useEffect(() => {
    setEnviarError(null);
  }, [currentStep]);
  const [stepValidation, setStepValidation] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false, // Step8_Adicionales se auto-valida como true en su useEffect
    9: true,  // Último paso: las acciones (Excel/Enviar) no dependen de isValid
  });

  // Obtener componente actual
  const CurrentStepComponent = STEPS_COMPONENTS[currentStep - 1];

  const observacionesDelPaso = observaciones.filter((o) => o.paso === currentStep);
  // Matcheadas: el Step actual sabe ubicarlas junto a su campo real (ver
  // camposConocidos.js) y ya se muestran ahí, junto con su propio bloque de
  // subsanación — no repetir su texto completo acá para no duplicarlo.
  // Sin match: no hay forma de anclarlas a un campo puntual del formulario,
  // así que degradan con gracia mostrando el texto completo + su propio
  // bloque de subsanación acá mismo, a nivel de paso.
  const observacionesMatcheadas = observacionesDelPaso.filter((o) => tieneCampoConocido(currentStep, o.campo));
  const observacionesSinMatch = observacionesDelPaso.filter((o) => !tieneCampoConocido(currentStep, o.campo));
  const camposSinMatch = [...new Set(observacionesSinMatch.map((o) => o.campo))];

  /**
   * Maneja cambios de datos en el paso actual.
   * Cada paso reporta su propia validez (isValid) en su useEffect,
   * por lo que aquí solo guardamos datos y validez tal cual llegan.
   */
  const handleStepDataChange = (stepData, isValid) => {
    const stepKey = `step${currentStep}_${getStepName(currentStep)}`;
    setFormData((prev) => ({
      ...prev,
      [stepKey]: stepData,
    }));
    setStepValidation((prev) => ({
      ...prev,
      [currentStep]: !!isValid,
    }));
  };

  /**
   * Obtiene el nombre del paso para la clave de datos
   */
  function getStepName(step) {
    const names = [
      'general',
      'inventario',
      'amenazas',
      'finalidad',
      'transferencia',
      'riesgos',
      'seguridad',
      'adicionales',
      'revision',
    ];
    return names[step - 1];
  }

  /**
   * Avanza al siguiente paso.
   * La validez la determina cada paso vía stepValidation[currentStep];
   * el botón "Siguiente" ya viene deshabilitado si el paso no es válido.
   * NOTA: el paso 9 (último) ya no dispara nada acá — sus acciones reales
   * (Descargar Excel, Enviar/Reenviar a PRODHAB) viven dentro de
   * Step9_Revision y NavigationButtons no muestra botón primario en ese paso.
   */
  const handleNext = async () => {
    if (isLoading) return; // evita doble click / doble PUT mientras hay un guardado en vuelo
    if (currentStep === TOTAL_STEPS) return; // sin acción: ver nota arriba

    if (readOnly) {
      // Modo consulta: solo navegar, sin validar ni guardar nada.
      setCurrentStep(currentStep + 1);
      return;
    }

    if (stepValidation[currentStep] !== true) return;

    // Guardar el paso en el backend. El respaldo en localStorage (WizardPage) sigue
    // ocurriendo siempre vía el useEffect existente; un fallo acá NUNCA bloquea el avance.
    setIsLoading(true);
    try {
      const datosPaso = extraerDatosPaso(formData, currentStep);
      await expedienteService.guardarPaso(expedienteId, currentStep, datosPaso, true);
      setSaveWarning(null);
    } catch (error) {
      console.error(`No se pudo guardar el paso ${currentStep} en el servidor:`, error);
      setSaveWarning(
        'No se pudo guardar en el servidor, pero tus datos están guardados localmente. Se reintentará.'
      );
    } finally {
      setIsLoading(false);
    }

    setCurrentStep(currentStep + 1);
  };

  /**
   * Retrocede al paso anterior
   */
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Pide confirmación antes de enviar el expediente a PRODHAB.
   */
  const handleEnviar = () => {
    setEnviarError(null);
    setMostrarConfirmacion(true);
  };

  /**
   * Confirmado el envío: llama al backend. Éxito → vuelve a la lista.
   * Error 409 (pasos faltantes u otro conflicto de estado) → banner no intrusivo, no navega.
   */
  const confirmarEnvio = async () => {
    setMostrarConfirmacion(false);
    setEnviando(true);
    setEnviarError(null);
    try {
      await expedienteService.enviar(expedienteId);
      const mensaje =
        estado === 'RequiereSubsanacion'
          ? 'Expediente reenviado correctamente.'
          : 'Expediente enviado a PRODHAB correctamente.';
      navigate('/expedientes', { state: { mensaje } });
    } catch (error) {
      if (error.status === 409) {
        setEnviarError(error.message);
      } else {
        console.error('No se pudo enviar el expediente:', error);
        setEnviarError('No se pudo enviar. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner de solo lectura: el expediente ya no es Borrador */}
      {readOnly && (
        <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3 rounded-xl bg-[#1B2A4A]/5 border border-[#1B2A4A]/20 text-[#1B2A4A] text-sm px-4 py-3">
          <Info size={16} className="flex-shrink-0" />
          {estado === 'Enviado'
            ? 'Este expediente ya fue enviado a PRODHAB. Está en modo solo lectura.'
            : `Estado: ${estado}. Solo lectura.`}
        </div>
      )}

      {/* Resumen de observaciones del Admin, agrupadas por paso, con acceso directo */}
      {estado === 'RequiereSubsanacion' && observaciones.length > 0 && (
        <ObservacionesResumen observaciones={observaciones} onIrAlPaso={setCurrentStep} />
      )}

      {/* Indicador de progreso */}
      <StepIndicator currentStep={currentStep} />

      {/* Contenido del paso con animación */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-8"
          style={{ boxShadow: '0 4px 24px rgba(27,42,74,0.08)' }}
        >
          {/* Banner de nivel de paso: ahora solo un resumen corto — el texto
              completo de cada observación ya se muestra una sola vez, junto a
              su campo (más abajo, dentro del Step, o en el bloque de fallback
              después del Step si no se pudo anclar a uno puntual). */}
          {observacionesMatcheadas.length > 0 && (
            <div className="mb-6 flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <p>
                Este paso tiene {observacionesMatcheadas.length}{' '}
                observación{observacionesMatcheadas.length === 1 ? '' : 'es'} pendiente
                {observacionesMatcheadas.length === 1 ? '' : 's'}, marcada
                {observacionesMatcheadas.length === 1 ? '' : 's'} junto al campo correspondiente más abajo.
              </p>
            </div>
          )}

          {/* Un fieldset deshabilitado desactiva nativamente todos los inputs/selects/
              textareas/botones de los 9 Steps sin tener que tocar cada componente. */}
          <fieldset disabled={readOnly && currentStep !== TOTAL_STEPS} className="border-0 p-0 m-0 min-w-0">
            <CurrentStepComponent
              data={
                currentStep === TOTAL_STEPS
                  ? formData
                  : (formData[`step${currentStep}_${getStepName(currentStep)}`] || {})
              }
              onChange={handleStepDataChange}
              onEnviar={handleEnviar}
              puedeEnviar={puedeEnviar}
              readOnly={readOnly}
              estado={estado}
              expedienteMeta={expedienteMeta}
              subsanacion={{
                paso: currentStep,
                observaciones: observacionesDelPaso,
                subsanaciones,
                expedienteId,
                estado,
                onCambio: onSubsanacionesChange,
              }}
            />
          </fieldset>

          {/* Observaciones que no se pudieron anclar a un campo puntual del
              formulario: su propio bloque de subsanación, a nivel de paso
              (fallback, no pierde la observación). */}
          {estado === 'RequiereSubsanacion' && camposSinMatch.length > 0 && (
            <div className="mt-6 space-y-3">
              {camposSinMatch.map((campoObs) => (
                <CampoObservacion
                  key={campoObs}
                  paso={currentStep}
                  campo={campoObs}
                  observaciones={observacionesDelPaso}
                  subsanaciones={subsanaciones}
                  expedienteId={expedienteId}
                  estado={estado}
                  onCambio={onSubsanacionesChange}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Aviso no intrusivo: el guardado en el servidor falló, pero los datos
          están a salvo en localStorage y el usuario puede seguir avanzando */}
      {saveWarning && (
        <div className="max-w-4xl mx-auto mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3">
          <AlertTriangle size={16} className="flex-shrink-0" />
          {saveWarning}
        </div>
      )}

      {/* Aviso no intrusivo: el envío a PRODHAB falló (409 por pasos faltantes u otro conflicto) */}
      {enviarError && (
        <div className="max-w-4xl mx-auto mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3">
          <AlertTriangle size={16} className="flex-shrink-0" />
          {enviarError}
        </div>
      )}

      {/* Botones de navegación (sin botón primario en el paso 9: sus acciones
          reales viven dentro de Step9_Revision) */}
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrev={handlePrev}
        isValid={readOnly || stepValidation[currentStep] === true}
        isLoading={isLoading}
      />

      {/* Confirmación antes de enviar a PRODHAB */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2">
              {estado === 'RequiereSubsanacion'
                ? '¿Reenviar el expediente subsanado a PRODHAB?'
                : '¿Enviar el expediente a PRODHAB?'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">Una vez enviado no podrás editarlo.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMostrarConfirmacion(false)}
                disabled={enviando}
                className="px-5 py-2.5 rounded-xl font-semibold text-[#1B2A4A] border-2 border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEnvio}
                disabled={enviando}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {enviando ? 'Enviando...' : 'Sí, enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}