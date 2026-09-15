import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import InicioRedirect from './components/Auth/InicioRedirect';
import { useAuth } from './context/AuthContext';
import MisExpedientes from './components/Expedientes/MisExpedientes';
import RevisionBandeja from './components/Revision/RevisionBandeja';
import RevisionExpediente from './components/Revision/RevisionExpediente';
import GestionUsuarios from './components/Usuarios/GestionUsuarios';
import PanelControl from './components/Panel/PanelControl';
import WizardPage from './pages/WizardPage';
import './App.css';

/**
 * App.jsx - Componente RAÍZ de la aplicación
 *
 * Responsabilidades:
 * - Router principal: /login, /expedientes (lista), /expedientes/:id (wizard)
 * - Layout general de las rutas que no son el wizard (Header + contenido)
 */

// /expedientes es la pantalla principal para el Usuario normal, pero para el Admin
// el Panel ya hace exactamente lo mismo (ver, filtrar, crear y editar sus propios
// borradores) y más — no tiene sentido que existan dos pantallas separadas para lo
// mismo. La ruta sigue viva (por si alguien la abre por URL vieja), pero al Admin
// lo manda directo al Panel en vez de duplicar la lista.
function RutaMisExpedientes() {
  const { user } = useAuth();
  if (user?.rol === 'Admin') {
    return <Navigate to="/panel" replace />;
  }
  return (
    <div className="h-screen flex flex-col bg-[#F7F3EA]">
      <Header />
      <main className="flex-1 overflow-y-auto bg-[#F1EBDD] p-8">
        <MisExpedientes />
      </main>
    </div>
  );
}

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

        {/* Lista de expedientes (protegida): landing del Usuario normal; el Admin
            se redirige a /panel (ver RutaMisExpedientes) */}
        <Route
          path="/expedientes"
          element={
            <ProtectedRoute>
              <RutaMisExpedientes />
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

        {/* Panel de Control del Admin: landing post-login (protegida, solo Admin) */}
        <Route
          path="/panel"
          element={
            <AdminRoute>
              <div className="h-screen flex flex-col bg-[#F7F3EA]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F1EBDD] p-8">
                  <PanelControl />
                </main>
              </div>
            </AdminRoute>
          }
        />

        {/* Panel de revisión del Admin: pantalla aparte del wizard (protegida, solo Admin) */}
        <Route
          path="/revision"
          element={
            <AdminRoute>
              <div className="h-screen flex flex-col bg-[#F7F3EA]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F1EBDD] p-8">
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
              <div className="h-screen flex flex-col bg-[#F7F3EA]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F1EBDD] p-8">
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
              <div className="h-screen flex flex-col bg-[#F7F3EA]">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#F1EBDD] p-8">
                  <GestionUsuarios />
                </main>
              </div>
            </AdminRoute>
          }
        />

        {/* Raíz y 404: Admin cae en su Panel, Usuario normal en Expedientes */}
        <Route path="/" element={<InicioRedirect />} />
        <Route path="*" element={<InicioRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;