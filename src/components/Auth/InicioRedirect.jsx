import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Destino de "/" y de cualquier ruta desconocida: el Admin cae siempre en su
// Panel (ya no en /expedientes), el Usuario normal sigue yendo a /expedientes.
// Reusa la misma regla que Login.jsx aplica justo después de autenticar.
export default function InicioRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Navigate to={user?.rol === 'Admin' ? '/panel' : '/expedientes'} replace />;
}
