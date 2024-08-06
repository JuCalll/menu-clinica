// frontend/src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

const Sidebar = () => {
  return (
    <div className="sidebar vh-100">
      <nav className="nav flex-column">
        <NavLink to="/" className="nav-link">Inicio</NavLink>
        <NavLink to="/menus" className="nav-link">Menús</NavLink>
        <NavLink to="/realizar-pedido" className="nav-link">Realizar Pedido</NavLink>
        <NavLink to="/pacientes" className="nav-link">Pacientes</NavLink>
        <NavLink to="/servicios-habitaciones" className="nav-link">Servicios y Habitaciones</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
