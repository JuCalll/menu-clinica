import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.scss';
import logo from '../assets/logo.png';

const Header = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
    };

    return (
        <header className="header navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container d-flex justify-content-between align-items-center">
                <div className="header-left d-flex align-items-center">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <div className="header-right">
                    <Link to="/login" className="nav-link" onClick={handleLogout}>Cerrar sesión</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
