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
        <NavLink to="/" className="nav-link">Inicio</NavLink>
        
        {/* Menús visible solo para admin y coordinador */}
        {(userRole === 'admin' || userRole === 'coordinador') && (
          <NavLink to="/menus" className="nav-link">Menús</NavLink>
        )}

        {(userRole === 'admin' || userRole === 'coordinador' || userRole === 'auxiliar' || userRole === 'jefe_enfermeria') && (
          <>
            <div 
              className={`nav-link pedidos-toggle ${isPedidosOpen ? 'open' : ''}`} 
              onClick={togglePedidosMenu} 
              style={{ cursor: 'pointer' }}
            >
              Pedidos
            </div>
            {isPedidosOpen && (
              <div className={`submenu ${isPedidosOpen ? 'submenu-open' : ''}`}>
                {/* Realizar Pedido visible para admin, jefe de enfermería y coordinador */}
                {(userRole === 'admin' || userRole === 'jefe_enfermeria' || userRole === 'coordinador') && (
                  <NavLink to="/realizar-pedido" className="nav-link submenu-item">Realizar Pedido</NavLink>
                )}
                {/* Pedidos Pendientes e Historial visible para admin, coordinador y auxiliar */}
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
              style={{ cursor: 'pointer' }}
            >
              Gestión de Datos
            </div>
            {isGestionDatosOpen && (
              <div className={`submenu ${isGestionDatosOpen ? 'submenu-open' : ''}`}>
                {/* Datos Generales visible para admin y jefe de enfermería */}
                {(userRole === 'admin' || userRole === 'jefe_enfermeria') && (
                  <NavLink to="/gestion-datos" className="nav-link submenu-item">Datos Generales</NavLink>
                )}
                {/* Gestión de Usuarios visible solo para admin */}
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
