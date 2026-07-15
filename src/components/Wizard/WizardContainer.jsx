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
    8: false, // Step8_Adicionales se auto-valida como true en su useEffect
    9: true,  // Último paso: botón "Descargar Excel" no depende de isValid
  });

  // Obtener componente actual
  const CurrentStepComponent = STEPS_COMPONENTS[currentStep - 1];

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
    } else if (stepValidation[currentStep] === true) {
      setCurrentStep(currentStep + 1);
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
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <CurrentStepComponent
            data={
              currentStep === TOTAL_STEPS
                ? formData
                : (formData[`step${currentStep}_${getStepName(currentStep)}`] || {})
            }
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
        isValid={stepValidation[currentStep] === true}
        isLoading={isLoading}
      />
    </div>
  );
}