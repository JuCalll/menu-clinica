import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente de ruta privada que redirige a la página de login si no hay un token de autenticación.
 *
 * @param {object} children - Componentes hijos que se renderizarán si el usuario está autenticado.
 * @returns {JSX.Element} Componente hijo si está autenticado, de lo contrario redirige a /login.
 */
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
