// Importamos React para crear componentes
import React from 'react';
// Importamos Navigate desde react-router-dom para redirigir al usuario
import { Navigate } from 'react-router-dom';

// Definimos el componente PrivateRoute para manejar rutas privadas
const PrivateRoute = ({ children }) => {
    // Obtenemos el token de autenticación desde el almacenamiento local (localStorage)
    const token = localStorage.getItem('token');
    
    // Si el token existe, renderizamos los componentes hijos (children)
    // Si no existe, redirigimos al usuario a la página de inicio de sesión ("/login")
    return token ? children : <Navigate to="/login" />;
};

// Exportamos el componente PrivateRoute para que pueda ser utilizado en otras partes de la aplicación
export default PrivateRoute;
