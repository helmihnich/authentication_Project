import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

interface RequireAuthProps {
  allowedRoles: string[]; // Assuming roles are strings like "editor", "admin"
}

const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles }) => {
  const { auth } = useAuth()!;
  const location = useLocation();

  // Ensure roles is an array, even if it is a string or undefined
  const userRoles = auth?.roles
    ? Array.isArray(auth.roles)
      ? auth.roles
      : [auth.roles]
    : [];

  // Check if any of the user's roles match allowedRoles
  const hasRequiredRole = userRoles.some((role) => allowedRoles.includes(role));

  return hasRequiredRole ? (
    <Outlet />
  ) : auth?.user ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
