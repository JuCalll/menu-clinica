// Sidebar.js

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

const Sidebar = () => {
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  const [isGestionDatosOpen, setIsGestionDatosOpen] = useState(false);

  const togglePedidosMenu = () => {
    setIsPedidosOpen(!isPedidosOpen);
  };

  const toggleGestionDatosMenu = () => {
    setIsGestionDatosOpen(!isGestionDatosOpen);
  };

  return (
    <div className="sidebar vh-100">
      <nav className="nav flex-column">
        <NavLink to="/" className="nav-link">Inicio</NavLink>
        <NavLink to="/menus" className="nav-link">Menús</NavLink>

        <div 
          className={`nav-link pedidos-toggle ${isPedidosOpen ? 'open' : ''}`} 
          onClick={togglePedidosMenu} 
          style={{ cursor: 'pointer' }}
        >
          Pedidos
        </div>
        {isPedidosOpen && (
          <div className={`submenu ${isPedidosOpen ? 'submenu-open' : ''}`}>
            <NavLink to="/realizar-pedido" className="nav-link submenu-item">Realizar Pedido</NavLink>
            <NavLink to="/pedidos/pendientes" className="nav-link submenu-item">Pedidos Pendientes</NavLink>
            <NavLink to="/pedidos/historial" className="nav-link submenu-item">Historial de Pedidos</NavLink>
          </div>
        )}

        <div 
          className={`nav-link gestion-datos-toggle ${isGestionDatosOpen ? 'open' : ''}`} 
          onClick={toggleGestionDatosMenu} 
          style={{ cursor: 'pointer' }}
        >
          Gestión de Datos
        </div>
        {isGestionDatosOpen && (
          <div className={`submenu ${isGestionDatosOpen ? 'submenu-open' : ''}`}>
            <NavLink to="/gestion-datos" className="nav-link submenu-item">Datos Generales</NavLink>
            <NavLink to="/gestion-usuarios" className="nav-link submenu-item">Gestión de Usuarios</NavLink>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
