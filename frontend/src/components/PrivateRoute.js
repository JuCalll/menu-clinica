import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');  // Obtenemos el rol desde el localStorage
    const location = useLocation();

    // Si no hay token, redirigir al login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si se requiere un rol específico y el usuario no lo tiene, redirigir al login
    if (requiredRoles && !requiredRoles.includes(userRole)) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si todo es correcto, renderizar el componente hijo
    return children;
};

export default PrivateRoute;
