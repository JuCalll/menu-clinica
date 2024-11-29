/**
 * Componente PrivateRoute
 * 
 * Componente de orden superior (HOC) que protege las rutas privadas de la aplicación.
 * Verifica:
 * - La existencia de un token válido
 * - Los roles requeridos para acceder a la ruta
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si la autenticación es exitosa
 * @param {string[]} [props.requiredRoles] - Array opcional de roles permitidos para acceder a la ruta
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, requiredRoles }) => {
  // Obtiene el token y rol del usuario del almacenamiento local
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  // Verifica la existencia del token
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica los roles requeridos si están especificados
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si pasa todas las verificaciones, renderiza los componentes hijos
  return children;
};

export default PrivateRoute;
