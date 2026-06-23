import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import WizardContainer from './components/Wizard/WizardContainer';
import './App.css';

/**
 * App.jsx - Componente RAÍZ de la aplicación
 * 
 * Responsabilidades:
 * - Router principal (navegación entre pasos)
 * - Estado global del formulario
 * - Layout general (Header + Sidebar + Contenido)
 */

function App() {
  // Estado global del formulario
  const [formData, setFormData] = useState({
    step1_general: {},
    step2_inventario: {},
    step3_amenazas: {},
    step4_finalidad: {},
    step5_transferencia: {},
    step6_riesgos: {},
    step7_seguridad: {},
    step8_revision: {},
  });

  // Estado de paso actual
  const [currentStep, setCurrentStep] = useState(1);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('prodhab_formData');
    if (saved) {
      setFormData(JSON.parse(saved));
      const savedStep = localStorage.getItem('prodhab_currentStep');
      if (savedStep) setCurrentStep(parseInt(savedStep));
    }
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    localStorage.setItem('prodhab_formData', JSON.stringify(formData));
    localStorage.setItem('prodhab_currentStep', currentStep.toString());
  }, [formData, currentStep]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Header Global */}
        <Header />

        <div className="flex gap-0">
          {/* Sidebar */}
          <Sidebar currentStep={currentStep} setCurrentStep={setCurrentStep} />

          {/* Contenido Principal */}
          <main className="flex-1 p-8">
            <Routes>
              {/* Ruta principal: Wizard */}
              <Route
                path="/"
                element={
                  <WizardContainer
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    formData={formData}
                    setFormData={setFormData}
                  />
                }
              />

              {/* Ruta 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;