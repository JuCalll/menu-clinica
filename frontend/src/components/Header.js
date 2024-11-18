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
  const name = localStorage.getItem("name");

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <header className={`header ${isDarkMode ? 'dark' : ''}`}>
      <div className="header-content">
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
