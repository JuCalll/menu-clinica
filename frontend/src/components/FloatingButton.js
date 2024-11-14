import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaHome, FaUtensils, FaShoppingCart, FaDatabase } from "react-icons/fa";
import "../styles/FloatingButton.scss";

const FloatingButton = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  const [isGestionDatosOpen, setIsGestionDatosOpen] = useState(false);
  const userRole = localStorage.getItem("role");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsPedidosOpen(false);
      setIsGestionDatosOpen(false);
    }
  };

  const togglePedidosMenu = (e) => {
    e.stopPropagation();
    setIsPedidosOpen(!isPedidosOpen);
    setIsGestionDatosOpen(false);
  };

  const toggleGestionDatosMenu = (e) => {
    e.stopPropagation();
    setIsGestionDatosOpen(!isGestionDatosOpen);
    setIsPedidosOpen(false);
  };

  return (
    <div className={`floating-button ${isDarkMode ? 'dark' : ''}`}>
      <button className="btn" onClick={toggleMenu} aria-label="Menú">
        <FaBars />
      </button>

      <div className={`floating-menu ${isOpen ? "show" : ""}`}>
        <NavLink to="/home" className="nav-link" onClick={toggleMenu}>
          <FaHome /> <span>Inicio</span>
        </NavLink>

        {(userRole === "admin" || userRole === "coordinador") && (
          <NavLink to="/menus" className="nav-link" onClick={toggleMenu}>
            <FaUtensils /> <span>Menús</span>
          </NavLink>
        )}

        {/* Menú de Pedidos */}
        {(userRole === "admin" || userRole === "coordinador" || 
          userRole === "auxiliar" || userRole === "jefe_enfermeria") && (
          <div className="nav-group">
            <div className={`nav-link pedidos-toggle ${isPedidosOpen ? "open" : ""}`}
                 onClick={togglePedidosMenu}>
              <FaShoppingCart /> <span>Pedidos</span>
            </div>
            {isPedidosOpen && (
              <div className="submenu submenu-open">
                {(userRole === "admin" ||
                  userRole === "jefe_enfermeria" ||
                  userRole === "coordinador") && (
                  <NavLink
                    to="/realizar-pedido"
                    className="nav-link submenu-item"
                    onClick={toggleMenu}
                  >
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
                      onClick={toggleMenu}
                    >
                      Pedidos Pendientes
                    </NavLink>
                    <NavLink
                      to="/pedidos/historial"
                      className="nav-link submenu-item"
                      onClick={toggleMenu}
                    >
                      Historial de Pedidos
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Menú de Gestión de Datos */}
        {(userRole === "admin" || userRole === "jefe_enfermeria") && (
          <div className="nav-group">
            <div className={`nav-link gestion-datos-toggle ${isGestionDatosOpen ? "open" : ""}`}
                 onClick={toggleGestionDatosMenu}>
              <FaDatabase /> <span>Gestión de Datos</span>
            </div>
            {isGestionDatosOpen && (
              <div className="submenu submenu-open">
                <NavLink
                  to="/gestion-datos"
                  className="nav-link submenu-item"
                  onClick={toggleMenu}
                >
                  Datos Generales
                </NavLink>
                {userRole === "admin" && (
                  <NavLink
                    to="/gestion-usuarios"
                    className="nav-link submenu-item"
                    onClick={toggleMenu}
                  >
                    Gestión de Usuarios
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingButton;
