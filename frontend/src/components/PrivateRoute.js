import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');  // Obtenemos el rol desde el localStorage
    
    // Si el token existe y el rol del usuario está en el arreglo de roles requeridos, renderizamos los componentes hijos
    // Si no, redirigimos al usuario a la página de inicio de sesión
    if (token && (!requiredRoles || requiredRoles.includes(userRole))) {
        return children;
    }
    return <Navigate to="/login" />;
};

export default PrivateRoute;
