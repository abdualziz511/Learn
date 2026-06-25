import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if role is not allowed
    const dashboards = {
      student: '/student',
      parent: '/parent',
      teacher: '/teacher',
      school_admin: '/admin',
      super_admin: '/super',
    };
    return <Navigate to={dashboards[role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
