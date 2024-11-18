import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUtensils, FaShoppingCart, FaDatabase, FaChevronRight } from "react-icons/fa";
import logo from "../assets/logoblanco.png";
import "../styles/Sidebar.scss";

const Sidebar = ({ isCollapsed, isDarkMode }) => {
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  const [isGestionDatosOpen, setIsGestionDatosOpen] = useState(false);
  const userRole = localStorage.getItem("role");

  const togglePedidosMenu = () => {
    if (!isCollapsed) {
      setIsPedidosOpen(!isPedidosOpen);
    }
  };

  const toggleGestionDatosMenu = () => {
    if (!isCollapsed) {
      setIsGestionDatosOpen(!isGestionDatosOpen);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <nav className="nav flex-column">
        <NavLink to="/home" className="nav-link" title="Inicio">
          <FaHome />
          <span className="nav-text">Inicio</span>
        </NavLink>

        {(userRole === "admin" || userRole === "coordinador") && (
          <NavLink to="/menus" className="nav-link" title="Menús">
            <FaUtensils />
            <span className="nav-text">Menús</span>
          </NavLink>
        )}

        {(userRole === "admin" || userRole === "coordinador" || 
          userRole === "auxiliar" || userRole === "jefe_enfermeria") && (
          <div className="nav-group">
            <div
              className={`nav-link pedidos-toggle ${isPedidosOpen ? "open" : ""}`}
              onClick={togglePedidosMenu}
              title="Pedidos"
            >
              <FaShoppingCart />
              <span className="nav-text">Pedidos</span>
              <FaChevronRight className="arrow-icon" />
            </div>
            
            <div className={`submenu ${isPedidosOpen ? 'submenu-open' : ''}`}>
              {(userRole === "admin" || userRole === "jefe_enfermeria" || 
                userRole === "coordinador") && (
                <NavLink to="/realizar-pedido" className="nav-link submenu-item">
                  Realizar Pedido
                </NavLink>
              )}
              {(userRole === "admin" ||
                userRole === "coordinador" ||
                userRole === "auxiliar") && (
                <>
                  <NavLink
                    to="/pedidos/pendientes"
                    className="nav-link submenu-item"
                  >
                    Pedidos Pendientes
                  </NavLink>
                  <NavLink
                    to="/pedidos/historial"
                    className="nav-link submenu-item"
                  >
                    Historial de Pedidos
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}

        {(userRole === "admin" || userRole === "jefe_enfermeria") && (
          <div className="nav-group">
            <div
              className={`nav-link gestion-datos-toggle ${isGestionDatosOpen ? "open" : ""}`}
              onClick={toggleGestionDatosMenu}
              title="Gestión de Datos"
            >
              <FaDatabase />
              <span className="nav-text">Gestión de Datos</span>
              <FaChevronRight className="arrow-icon" />
            </div>
            
            <div className={`submenu ${isGestionDatosOpen ? 'submenu-open' : ''}`}>
              {(userRole === "admin" || userRole === "jefe_enfermeria") && (
                <NavLink
                  to="/gestion-datos"
                  className="nav-link submenu-item"
                >
                  Datos Generales
                </NavLink>
              )}
              {userRole === "admin" && (
                <NavLink
                  to="/gestion-usuarios"
                  className="nav-link submenu-item"
                >
                  Gestión de Usuarios
                </NavLink>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="sidebar-footer">
        <img src={logo} alt="Logo" className="footer-logo" />
      </div>
    </div>
  );
};

export default Sidebar;
