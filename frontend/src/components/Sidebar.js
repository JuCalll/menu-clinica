import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

const Sidebar = () => {
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);

  const togglePedidosMenu = () => {
    setIsPedidosOpen(!isPedidosOpen);
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
        
        <NavLink to="/gestion-datos" className="nav-link">Gestión de Datos</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
