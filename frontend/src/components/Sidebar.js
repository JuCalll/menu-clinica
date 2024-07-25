import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

const Sidebar = () => {
    return (
        <div className="sidebar vh-100">
            <nav className="nav flex-column">
                <NavLink to="/" className="nav-link">
                    Inicio
                </NavLink>
                <NavLink to="/menu_personalizado" className="nav-link">
                    Menús Personalizados
                </NavLink>
                <NavLink to="/pedidos" className="nav-link">
                    Pedidos
                </NavLink>
                <NavLink to="/pacientes" className="nav-link">
                    Pacientes
                </NavLink>
                <NavLink to="/servicios-habitaciones" className="nav-link">
                    Servicios y Habitaciones
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
