/**
 * Componente Header
 * 
 * Barra de navegación superior que contiene:
 * - Logo de la aplicación
 * - Botón para colapsar/expandir el sidebar
 * - Switch para cambiar el tema (claro/oscuro)
 * - Nombre del usuario
 * - Botón de cierre de sesión
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.toggleSidebar - Función para alternar la visibilidad del sidebar
 * @param {Function} props.toggleTheme - Función para cambiar entre tema claro y oscuro
 * @param {boolean} props.isDarkMode - Estado actual del tema (true = oscuro)
 * @param {boolean} props.isCollapsed - Estado actual del sidebar (true = colapsado)
 */

import React from "react";
import { Link } from "react-router-dom";
import { Switch } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import "../styles/Header.scss";
import logo from "../assets/logoblanco.png";
import api from "../services/api";

const Header = ({ 
  toggleSidebar, 
  toggleTheme, 
  isDarkMode, 
  isCollapsed 
}) => {
  // Obtiene el nombre del usuario del almacenamiento local
  const name = localStorage.getItem("name");

  /**
   * Maneja el proceso de cierre de sesión
   * - Invalida el token de refresco en el backend
   * - Limpia el almacenamiento local
   * - Redirige al usuario a la página de login
   */
  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch (error) {
      // Manejo silencioso del error, continúa con el logout
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <header className={`header ${isDarkMode ? 'dark' : ''}`}>
      <div className="header-content">
        {/* Sección izquierda: logo y botón de colapso */}
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <button 
            className="collapse-button" 
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        {/* Sección derecha: switch de tema, nombre de usuario y botón de logout */}
        <div className="header-right">
          <Switch
            className="theme-switch"
            checked={isDarkMode}
            onChange={toggleTheme}
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
          />
          {name && <span className="username">Bienvenido, {name}</span>}
          <Link to="/login" className="logout-link" onClick={handleLogout}>
            Cerrar sesión
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
