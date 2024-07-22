import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/menus" className={({ isActive }) => isActive ? 'active' : ''}>Menus</NavLink>
            <NavLink to="/pedidos" className={({ isActive }) => isActive ? 'active' : ''}>Pedidos</NavLink>
            <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'active' : ''}>Pacientes</NavLink>
            <NavLink to="/servicios-habitaciones" className={({ isActive }) => isActive ? 'active' : ''}>Servicios y Habitaciones</NavLink>
        </div>
    );
};

export default Sidebar;
