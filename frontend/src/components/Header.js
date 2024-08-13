// Importamos React para crear componentes
import React from 'react';
// Importamos Link desde react-router-dom para manejar la navegación entre páginas
import { Link } from 'react-router-dom';
// Importamos el archivo de estilos SCSS para este componente
import '../styles/Header.scss';
// Importamos el logo de la aplicación desde la carpeta assets
import logo from '../assets/logo.png';

// Definimos el componente Header
const Header = () => {
    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        // Removemos el token de autenticación del almacenamiento local (localStorage)
        localStorage.removeItem('token');
    };

    // Renderizamos el encabezado (header) de la aplicación
    return (
        <header className="header navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container d-flex justify-content-between align-items-center">
                {/* Sección izquierda del encabezado con el logo */}
                <div className="header-left d-flex align-items-center">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                {/* Sección derecha del encabezado con el enlace para cerrar sesión */}
                <div className="header-right">
                    {/* Enlace para cerrar sesión, que redirige a la página de login y ejecuta handleLogout */}
                    <Link to="/login" className="nav-link" onClick={handleLogout}>Cerrar sesión</Link>
                </div>
            </div>
        </header>
    );
};

// Exportamos el componente Header para que pueda ser utilizado en otras partes de la aplicación
export default Header;
