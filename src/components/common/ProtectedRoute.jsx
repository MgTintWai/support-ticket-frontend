import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getToken } from '../../utils/storage';

export default function ProtectedRoute({ children }) {
  const { isLoading } = useAuth();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Loading session...</p>
      </div>
    );
  }

  return children;
}
