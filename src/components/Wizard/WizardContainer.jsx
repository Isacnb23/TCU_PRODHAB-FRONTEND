import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepIndicator from './StepIndicator';
import NavigationButtons from './NavigationButtons';
import Step1_General from '../Forms/Step1_General';
import Step2_Inventario from '../Forms/Step2_Inventario';
import Step3_Amenazas from '../Forms/Step3_Amenazas';
import Step4_Finalidad from '../Forms/Step4_Finalidad';
import Step5_Transferencia from '../Forms/Step5_Transferencia';
import Step6_Riesgos from '../Forms/Step6_Riesgos';
import Step7_Seguridad from '../Forms/Step7_Seguridad';
import Step8_Revision from '../Forms/Step8_Revision';

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

const TOTAL_STEPS = 8;

const STEPS_COMPONENTS = [
  Step1_General,
  Step2_Inventario,
  Step3_Amenazas,
  Step4_Finalidad,
  Step5_Transferencia,
  Step6_Riesgos,
  Step7_Seguridad,
  Step8_Revision,
];

export default function WizardContainer({
  currentStep,
  setCurrentStep,
  formData,
  setFormData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [stepValidation, setStepValidation] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
  });

  // Obtener componente actual
  const CurrentStepComponent = STEPS_COMPONENTS[currentStep - 1];

  /**
   * Maneja cambios de datos en el paso actual
   */
  const handleStepDataChange = (stepData) => {
    const stepKey = `step${currentStep}_${getStepName(currentStep)}`;
    setFormData((prev) => ({
      ...prev,
      [stepKey]: stepData,
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
      'revision',
    ];
    return names[step - 1];
  }

  /**
   * Valida el paso actual
   */
  const validateCurrentStep = () => {
    // Validación básica - puede expandirse
    const stepKey = `step${currentStep}_${getStepName(currentStep)}`;
    const stepData = formData[stepKey];
    
    // Para este ejemplo, consideramos válido si hay algún dato
    const isValid = stepData && Object.keys(stepData).length > 0;
    
    setStepValidation((prev) => ({
      ...prev,
      [currentStep]: isValid,
    }));

    return isValid;
  };

  /**
   * Avanza al siguiente paso
   */
  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS) {
      // Último paso - descargar Excel
      setIsLoading(true);
      try {
        // TODO: Implementar descarga de Excel
        console.log('Descargando Excel...', formData);
        // Simular delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert('✅ Excel descargado exitosamente');
      } catch (error) {
        alert('❌ Error al descargar Excel: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Validar antes de avanzar
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
      } else {
        alert('⚠️ Por favor completa los campos obligatorios');
      }
    }
  };

  /**
   * Retrocede al paso anterior
   */
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
          className="bg-white rounded-lg shadow-sm p-8 mt-6"
        >
          <CurrentStepComponent
            data={formData[`step${currentStep}_${getStepName(currentStep)}`] || {}}
            onChange={handleStepDataChange}
          />
        </motion.div>
      </AnimatePresence>

      {/* Botones de navegación */}
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrev={handlePrev}
        isValid={stepValidation[currentStep] !== false}
        isLoading={isLoading}
      />

      {/* Información de debug (remover en producción) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-600">
          <p>Debug: Paso {currentStep} | Datos guardados: {Object.keys(formData).length}</p>
        </div>
      )}
    </div>
  );
}