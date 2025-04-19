import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuthStore();

  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (!requireAuth && isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;