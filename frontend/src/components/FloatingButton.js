/**
 * Componente de botón flotante con menú desplegable.
 * 
 * Proporciona navegación rápida a diferentes secciones de la aplicación:
 * - Inicio
 * - Menús (para admin y coordinador)
 * - Pedidos (con submenú)
 * - Gestión de Datos (con submenú)
 * 
 * El acceso a las diferentes opciones está controlado por roles de usuario.
 */

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaHome, FaUtensils, FaShoppingCart, FaDatabase } from "react-icons/fa";
import "../styles/FloatingButton.scss";

/**
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isDarkMode - Controla el tema oscuro/claro del botón
 */
const FloatingButton = ({ isDarkMode }) => {
  // Estados para controlar la visibilidad de los menús
  const [isOpen, setIsOpen] = useState(false);
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  const [isGestionDatosOpen, setIsGestionDatosOpen] = useState(false);
  const userRole = localStorage.getItem("role");

  /**
   * Alterna la visibilidad del menú principal
   * Cierra los submenús cuando se cierra el menú principal
   */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsPedidosOpen(false);
      setIsGestionDatosOpen(false);
    }
  };

  /**
   * Alterna la visibilidad del submenú de pedidos
   * @param {Event} e - Evento del click
   */
  const togglePedidosMenu = (e) => {
    e.stopPropagation();
    setIsPedidosOpen(!isPedidosOpen);
    setIsGestionDatosOpen(false);
  };

  /**
   * Alterna la visibilidad del submenú de gestión de datos
   * @param {Event} e - Evento del click
   */
  const toggleGestionDatosMenu = (e) => {
    e.stopPropagation();
    setIsGestionDatosOpen(!isGestionDatosOpen);
    setIsPedidosOpen(false);
  };

  /**
   * Renderiza el botón flotante y su menú desplegable
   * @returns {JSX.Element} Botón flotante con menú de navegación
   */
  return (
    <div className={`floating-button ${isDarkMode ? 'dark' : ''}`}>
      {/* Botón principal que despliega el menú */}
      <button className="btn" onClick={toggleMenu} aria-label="Menú">
        <FaBars />
      </button>

      <div className={`floating-menu ${isOpen ? "show" : ""}`}>
        {/* Enlace a inicio - accesible para todos los roles */}
        <NavLink to="/home" className="nav-link" onClick={toggleMenu}>
          <FaHome /> <span>Inicio</span>
        </NavLink>

        {/* Enlace a menús - solo para admin y coordinador */}
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

        {/* Menú de Gestión de Datos - solo para admin y jefe de enfermería */}
        {(userRole === "admin" || userRole === "jefe_enfermeria") && (
          <div className="nav-group">
            <div className={`nav-link gestion-datos-toggle ${isGestionDatosOpen ? "open" : ""}`}
                 onClick={toggleGestionDatosMenu}>
              <FaDatabase /> <span>Gestión de Datos</span>
            </div>
            {isGestionDatosOpen && (
              <div className="submenu submenu-open">
                {/* Datos Generales - accesible para admin y jefe de enfermería */}
                <NavLink
                  to="/gestion-datos"
                  className="nav-link submenu-item"
                  onClick={toggleMenu}
                >
                  Datos Generales
                </NavLink>
                {/* Gestión de Usuarios - exclusivo para admin */}
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

// Exportación del componente
export default FloatingButton;
