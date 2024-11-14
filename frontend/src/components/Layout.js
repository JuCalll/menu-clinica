import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import FloatingButton from "./FloatingButton";
import { Outlet, useLocation } from "react-router-dom";
import { ConfigProvider, theme, Layout as AntLayout } from 'antd';
import "../styles/Layout.scss";

const { Content } = AntLayout;

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const location = useLocation();

  useEffect(() => {
    const content = document.querySelector('.content');
    if (content) {
      content.style.opacity = '0';
      setTimeout(() => {
        content.style.opacity = '1';
      }, 50);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
