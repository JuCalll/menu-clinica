/**
 * Componente Sidebar
 * 
 * Barra de navegación lateral que muestra las opciones de menú según el rol del usuario.
 * Incluye:
 * - Navegación principal
 * - Submenús desplegables
 * - Popovers para modo colapsado
 * - Control de acceso basado en roles
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isCollapsed - Estado de colapso del sidebar
 * @param {boolean} props.isDarkMode - Estado del tema oscuro
 */

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUtensils, FaShoppingCart, FaDatabase, FaChevronRight } from "react-icons/fa";
import logo from "../assets/logoblanco.png";
import "../styles/Sidebar.scss";
import { Popover } from "antd";

const Sidebar = ({ isCollapsed, isDarkMode }) => {
  // Estados para controlar la apertura de submenús
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  const [isGestionDatosOpen, setIsGestionDatosOpen] = useState(false);
  const userRole = localStorage.getItem("role");

  /**
   * Alterna la visibilidad del submenú de pedidos
   * Solo funciona cuando el sidebar no está colapsado
   */
  const togglePedidosMenu = () => {
    if (!isCollapsed) {
      setIsPedidosOpen(!isPedidosOpen);
    }
  };

  /**
   * Alterna la visibilidad del submenú de gestión de datos
   * Solo funciona cuando el sidebar no está colapsado
   */
  const toggleGestionDatosMenu = () => {
    if (!isCollapsed) {
      setIsGestionDatosOpen(!isGestionDatosOpen);
    }
  };

  /**
   * Renderiza el contenido del popover de pedidos
   * @returns {JSX.Element} Menú de opciones de pedidos
   */
  const renderPedidosContent = () => (
    <div className="popover-menu">
      {(userRole === "admin" || userRole === "jefe_enfermeria" || 
        userRole === "coordinador") && (
        <NavLink to="/realizar-pedido" className="popover-item">
          Realizar Pedido
        </NavLink>
      )}
      {(userRole === "admin" ||
        userRole === "coordinador" ||
        userRole === "auxiliar") && (
        <>
          <NavLink to="/pedidos/pendientes" className="popover-item">
            Pedidos Pendientes
          </NavLink>
          <NavLink to="/pedidos/historial" className="popover-item">
            Historial de Pedidos
          </NavLink>
        </>
      )}
    </div>
  );

  /**
   * Renderiza el contenido del popover de gestión de datos
   * @returns {JSX.Element} Menú de opciones de gestión
   */
  const renderGestionDatosContent = () => (
    <div className="popover-menu">
      {(userRole === "admin" || userRole === "jefe_enfermeria") && (
        <NavLink to="/gestion-datos" className="popover-item">
          Datos Generales
        </NavLink>
      )}
      {userRole === "admin" && (
        <NavLink to="/gestion-usuarios" className="popover-item">
          Gestión de Usuarios
        </NavLink>
      )}
    </div>
  );

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <nav className="nav flex-column">
        {/* Enlace de inicio - visible para todos los roles */}
        <NavLink to="/home" className="nav-link" title="Inicio">
          <FaHome />
          <span className="nav-text">Inicio</span>
        </NavLink>

        {/* Enlace de menús - visible solo para admin y coordinador */}
        {(userRole === "admin" || userRole === "coordinador") && (
          <NavLink to="/menus" className="nav-link" title="Menús">
            <FaUtensils />
            <span className="nav-text">Menús</span>
          </NavLink>
        )}

        {/* Sección de pedidos con submenú */}
        {(userRole === "admin" || userRole === "coordinador" || 
          userRole === "auxiliar" || userRole === "jefe_enfermeria") && (
          <div className="nav-group">
            <Popover
              content={renderPedidosContent}
              trigger="click"
              placement="right"
              open={isCollapsed ? undefined : false}
            >
              <div
                className={`nav-link pedidos-toggle ${isPedidosOpen ? "open" : ""}`}
                onClick={togglePedidosMenu}
                title="Pedidos"
              >
                <FaShoppingCart />
                <span className="nav-text">Pedidos</span>
                <FaChevronRight className="arrow-icon" />
              </div>
            </Popover>
            
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

        {/* Sección de gestión de datos con submenú */}
        {(userRole === "admin" || userRole === "jefe_enfermeria") && (
          <div className="nav-group">
            <Popover
              content={renderGestionDatosContent}
              trigger="click"
              placement="right"
              visible={isCollapsed ? undefined : false}
            >
              <div
                className={`nav-link gestion-datos-toggle ${isGestionDatosOpen ? "open" : ""}`}
                onClick={toggleGestionDatosMenu}
                title="Gestión de Datos"
              >
                <FaDatabase />
                <span className="nav-text">Gestión de Datos</span>
                <FaChevronRight className="arrow-icon" />
              </div>
            </Popover>
            
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
      
      {/* Footer del sidebar con logo */}
      <div className="sidebar-footer">
        <img src={logo} alt="Logo" className="footer-logo" />
      </div>
    </div>
  );
};

export default Sidebar;
