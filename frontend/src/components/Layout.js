/**
 * Componente Layout
 * 
 * Componente principal que define la estructura base de la aplicación.
 * Gestiona:
 * - La disposición general de la interfaz
 * - El estado del tema (claro/oscuro)
 * - El estado del sidebar (expandido/colapsado)
 * - Las transiciones entre rutas
 */

import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import FloatingButton from "./FloatingButton";
import { Outlet, useLocation } from "react-router-dom";
import { ConfigProvider, theme, Layout as AntLayout } from 'antd';
import "../styles/Layout.scss";

const { Content } = AntLayout;

const Layout = () => {
  // Estado para controlar el colapso del sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Estado para el tema, inicializado desde localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const location = useLocation();

  /**
   * Efecto para manejar la transición de contenido entre rutas
   * Aplica una animación de fade al cambiar de página
   */
  useEffect(() => {
    const content = document.querySelector('.content');
    if (content) {
      content.style.opacity = '0';
      setTimeout(() => {
        content.style.opacity = '1';
      }, 50);
    }
  }, [location.pathname]);

  /**
   * Alterna el estado de colapso del sidebar
   */
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  /**
   * Alterna el tema entre claro y oscuro
   * Actualiza el estado y persiste la preferencia en localStorage
   */
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#174288',
          borderRadius: 8,
          fontFamily: 'Syne, sans-serif',
        },
      }}
    >
      <AntLayout className={`layout ${isDarkMode ? 'dark-mode' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          toggleSidebar={toggleSidebar} 
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          isCollapsed={isSidebarCollapsed}
        />
        <AntLayout className="main-layout">
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            isDarkMode={isDarkMode}
          />
          <Content className="main-content">
            <div className="content-wrapper">
              <div className="content">
                <Outlet />
              </div>
            </div>
          </Content>
        </AntLayout>
        <FloatingButton isDarkMode={isDarkMode} />
      </AntLayout>
    </ConfigProvider>
  );
};

export default Layout;
