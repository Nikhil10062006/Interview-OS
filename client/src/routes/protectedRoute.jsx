import Spinner from "../components/spinner.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <Spinner />;
  }
  if (user) {
    return children;
  }
  return <Navigate to="/login" replace />;
}
