import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

/**
 * Componente Sidebar que contiene enlaces de navegación para las diferentes secciones de la aplicación.
 *
 * @returns {JSX.Element} Barra lateral con enlaces de navegación.
 */
const Sidebar = () => {
    return (
        <div className="sidebar">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink>
            <NavLink to="/menus" className={({ isActive }) => isActive ? 'active' : ''}>Menús</NavLink>
            <NavLink to="/pedidos" className={({ isActive }) => isActive ? 'active' : ''}>Pedidos</NavLink>
            <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'active' : ''}>Pacientes</NavLink>
        </div>
    );
};

export default Sidebar;
