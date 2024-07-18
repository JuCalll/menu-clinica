import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.scss';
import logo from '../assets/logo.png'; // Asegúrate de tener el logo en esta ruta

/**
 * Componente Header que muestra el logo y un enlace para cerrar sesión.
 */
const Header = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
    };

    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="Logo" className="logo" />
            </div>
            <nav className="header-right">
                <Link to="/login" onClick={handleLogout}>Cerrar sesión</Link>
            </nav>
        </header>
    );
};

export default Header;
