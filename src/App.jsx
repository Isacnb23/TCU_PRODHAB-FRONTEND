import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import MisExpedientes from './components/Expedientes/MisExpedientes';
import RevisionBandeja from './components/Revision/RevisionBandeja';
import RevisionExpediente from './components/Revision/RevisionExpediente';
import GestionUsuarios from './components/Usuarios/GestionUsuarios';
import WizardPage from './pages/WizardPage';
import './App.css';

/**
 * App.jsx - Componente RAÍZ de la aplicación
 *
 * Responsabilidades:
 * - Router principal: /login, /expedientes (lista), /expedientes/:id (wizard)
 * - Layout general de las rutas que no son el wizard (Header + contenido)
 */

function App() {
  // Las claves globales de localStorage (prodhab_formData/prodhab_currentStep)
  // quedaron obsoletas: el wizard ahora respalda por expediente
  // (prodhab_formData_{id} / prodhab_currentStep_{id}, ver WizardPage.jsx).
  useEffect(() => {
    localStorage.removeItem('prodhab_formData');
    localStorage.removeItem('prodhab_currentStep');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Lista de expedientes (protegida) */}
        <Route
          path="/expedientes"
          element={
            <ProtectedRoute>
              <div className="h-screen flex flex-col bg-[#EEF2F7]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F0F4F8] p-8">
                  <MisExpedientes />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Wizard sobre un expediente puntual (protegida) */}
        <Route
          path="/expedientes/:id"
          element={
            <ProtectedRoute>
              <WizardPage />
            </ProtectedRoute>
          }
        />

        {/* Panel de revisión del Admin: pantalla aparte del wizard (protegida, solo Admin) */}
        <Route
          path="/revision"
          element={
            <AdminRoute>
              <div className="h-screen flex flex-col bg-[#EEF2F7]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F0F4F8] p-8">
                  <RevisionBandeja />
                </main>
              </div>
            </AdminRoute>
          }
        />
        <Route
          path="/revision/:id"
          element={
            <AdminRoute>
              <div className="h-screen flex flex-col bg-[#EEF2F7]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F0F4F8] p-8">
                  <RevisionExpediente />
                </main>
              </div>
            </AdminRoute>
          }
        />

        {/* Gestión de usuarios del Admin: pantalla aparte del wizard (protegida, solo Admin) */}
        <Route
          path="/usuarios"
          element={
            <AdminRoute>
              <div className="h-screen flex flex-col bg-[#EEF2F7]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F0F4F8] p-8">
                  <GestionUsuarios />
                </main>
              </div>
            </AdminRoute>
          }
        />

        {/* Raíz y 404: siempre a la lista de expedientes */}
        <Route path="/" element={<Navigate to="/expedientes" replace />} />
        <Route path="*" element={<Navigate to="/expedientes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;