import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

const Sidebar = () => {
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  const [isGestionDatosOpen, setIsGestionDatosOpen] = useState(false);
  const userRole = localStorage.getItem('role');  // Obtener el rol del usuario

  const togglePedidosMenu = () => {
    setIsPedidosOpen(!isPedidosOpen);
  };

  const toggleGestionDatosMenu = () => {
    setIsGestionDatosOpen(!isGestionDatosOpen);
  };

  return (
    <div className="sidebar vh-100">
      <nav className="nav flex-column">
        <NavLink to="/home" className="nav-link">Inicio</NavLink>
        
        {(userRole === 'admin' || userRole === 'coordinador') && (
          <NavLink to="/menus" className="nav-link">Menús</NavLink>
        )}

        {(userRole === 'admin' || userRole === 'coordinador' || userRole === 'auxiliar' || userRole === 'jefe_enfermeria') && (
          <>
            <div 
              className={`nav-link pedidos-toggle ${isPedidosOpen ? 'open' : ''}`} 
              onClick={togglePedidosMenu} 
            >
              Pedidos
            </div>
            {isPedidosOpen && (
              <div className="submenu submenu-open">
                {(userRole === 'admin' || userRole === 'jefe_enfermeria' || userRole === 'coordinador') && (
                  <NavLink to="/realizar-pedido" className="nav-link submenu-item">Realizar Pedido</NavLink>
                )}
                {(userRole === 'admin' || userRole === 'coordinador' || userRole === 'auxiliar') && (
                  <>
                    <NavLink to="/pedidos/pendientes" className="nav-link submenu-item">Pedidos Pendientes</NavLink>
                    <NavLink to="/pedidos/historial" className="nav-link submenu-item">Historial de Pedidos</NavLink>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {(userRole === 'admin' || userRole === 'jefe_enfermeria') && (
          <>
            <div 
              className={`nav-link gestion-datos-toggle ${isGestionDatosOpen ? 'open' : ''}`} 
              onClick={toggleGestionDatosMenu} 
            >
              Gestión de Datos
            </div>
            {isGestionDatosOpen && (
              <div className="submenu submenu-open">
                {(userRole === 'admin' || userRole === 'jefe_enfermeria') && (
                  <NavLink to="/gestion-datos" className="nav-link submenu-item">Datos Generales</NavLink>
                )}
                {userRole === 'admin' && (
                  <NavLink to="/gestion-usuarios" className="nav-link submenu-item">Gestión de Usuarios</NavLink>
                )}
              </div>
            )}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
